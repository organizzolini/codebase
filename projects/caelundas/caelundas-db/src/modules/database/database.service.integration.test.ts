import moment from "moment-timezone";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import {
  CAELUNDAS_DATABASE_MIGRATIONS,
  DATABASE_ENTITIES,
} from "./data-source.constants";
import { DatabaseModule } from "./database.module";
import { DatabaseService } from "./database.service";
import { CalendarEventDerivedTime } from "./modules/calendar-events/calendar-event-derived-time.entity";
import { CalendarEventTag } from "./modules/calendar-events/calendar-event-tag.entity";
import { CalendarEvent } from "./modules/calendar-events/calendar-event.entity";
import { Tag } from "./modules/tags/tag.entity";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { TreeRepository } from "typeorm";

// 🧪 Tests

/** Starting Postgres and running the migration takes longer than a test. */
const CONTAINER_TIMEOUT_MILLISECONDS = 120_000;

/**
 * Rebuilds the read model on a throwaway Postgres container migrated by the
 * project's real migration: base rows go in through the entities, the refresh
 * runs, and the facts view and the derived-times view are asserted.
 */
describe(DatabaseService, () => {
  let database: DatabaseTestingModule;
  let service: DatabaseService;
  let tags: TreeRepository<Tag>;
  let mars: Tag;
  let planet: Tag;
  let retrograde: Tag;
  let event: CalendarEvent;

  beforeAll(async () => {
    database = await startDatabaseTestingModule({
      database: DatabaseModule,
      entities: [...DATABASE_ENTITIES],
      migrations: [...CAELUNDAS_DATABASE_MIGRATIONS],
      project: "caelundas",
    });
    service = database.module.get(DatabaseService);
    tags = database.dataSource.getTreeRepository(Tag);
  }, CONTAINER_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    await database.dataSource.query(
      "truncate calendar_event_tags, calendar_events, tags, tags_closure cascade",
    );
    planet = await tags.save(tags.create({ name: "Planet" }));
    mars = await tags.save(tags.create({ name: "Mars", parent: planet }));
    retrograde = await tags.save(
      tags.create({ name: "Retrograde", parent: mars }),
    );
    event = await database.repository(CalendarEvent).save(
      database.repository(CalendarEvent).create({
        description: "Mars stations retrograde",
        end: moment.utc("2026-03-05T05:00:00.000Z"),
        latitude: "40.712800",
        longitude: "-74.006000",
        start: moment.utc("2026-03-05T03:30:00.000Z"),
        summary: "Mars Retrograde",
        timezone: "America/New_York",
      }),
    );
    await database
      .repository(CalendarEventTag)
      .insert({ calendarEventId: event.id, tagId: retrograde.id });
  });

  afterAll(async () => {
    await database.close();
  });

  /** The day-tag rows of the facts: each tag the event carries, with its depth, root, path and rank. */
  async function readTagRows(): Promise<
    {
      tag_depth: string;
      tag_name: string;
      tag_path: string;
      tag_rank: string;
      tag_root_id: string;
    }[]
  > {
    return database.dataSource.query(
      `select tag_name, tag_depth, tag_root_id, tag_path, tag_rank from calendar_event_facts where "filter" = 'day-tag' order by tag_depth`,
    );
  }

  it("fills each tag's depth, root, path and rank into the day-tag rows", async () => {
    expect.hasAssertions();

    await service.refreshMetrics(database.dataSource.manager);

    await expect(readTagRows()).resolves.toStrictEqual([
      {
        tag_depth: "0",
        tag_name: "Planet",
        tag_path: "Planet",
        tag_rank: "00000:Planet",
        tag_root_id: planet.id,
      },
      {
        tag_depth: "1",
        tag_name: "Mars",
        tag_path: "Planet / Mars",
        tag_rank: "00000:Planet / 00000:Mars",
        tag_root_id: planet.id,
      },
      {
        tag_depth: "2",
        tag_name: "Retrograde",
        tag_path: "Planet / Mars / Retrograde",
        tag_rank: "00000:Planet / 00000:Mars / 00000:Retrograde",
        tag_root_id: planet.id,
      },
    ]);
  });

  it("gives the event row every tag it carries and every ancestor, and the one it was given", async () => {
    expect.hasAssertions();

    await service.refreshMetrics(database.dataSource.manager);

    const [row] = await database.dataSource.query<
      { direct_tag_ids: string[]; tag_ids: string[] }[]
    >(
      `select tag_ids, direct_tag_ids from calendar_event_facts where "filter" = 'event' and calendar_event_id = $1`,
      [event.id],
    );

    expect(row?.tag_ids.toSorted()).toStrictEqual(
      [planet.id, mars.id, retrograde.id].toSorted(),
    );
    expect(row?.direct_tag_ids).toStrictEqual([retrograde.id]);
  });

  it("replaces what it built before, so a removed tag leaves no stale row", async () => {
    expect.hasAssertions();

    await service.refreshMetrics(database.dataSource.manager);
    await database
      .repository(CalendarEventTag)
      .delete({ calendarEventId: event.id });
    await service.refreshMetrics(database.dataSource.manager);

    await expect(readTagRows()).resolves.toHaveLength(0);
  });

  it("runs inside the caller's transaction, so a rollback keeps the earlier view", async () => {
    expect.hasAssertions();

    await service.refreshMetrics(database.dataSource.manager);
    await database
      .repository(CalendarEventTag)
      .delete({ calendarEventId: event.id });

    await database.dataSource.manager
      .transaction(async (manager) => {
        await service.refreshMetrics(manager);

        throw new Error("roll back");
      })
      .catch(() => {});

    await expect(readTagRows()).resolves.toHaveLength(3);
  });

  it("keeps a phase boundary, flagged, and refreshes twice with nothing changed", async () => {
    expect.hasAssertions();

    const forming = await tags.save(
      tags.create({
        name: "Forming",
        parent: await tags.save(
          tags.create({
            name: "Phase",
            parent: await tags.save(tags.create({ name: "Aspect" })),
          }),
        ),
      }),
    );
    await database
      .repository(CalendarEventTag)
      .insert({ calendarEventId: event.id, tagId: forming.id });
    await service.refreshMetrics(database.dataSource.manager);
    await service.refreshMetrics(database.dataSource.manager);

    const rows = await database.dataSource.query<
      { filter: string; is_phase_boundary: boolean }[]
    >(
      `select distinct "filter", is_phase_boundary from calendar_event_facts where "filter" in ('event', 'day') order by 1`,
    );

    expect(rows).toStrictEqual([
      { filter: "day", is_phase_boundary: true },
      { filter: "event", is_phase_boundary: true },
    ]);
  });

  it("derives an event's UTC and local times in the view, in the zone the event names", async () => {
    expect.hasAssertions();

    const [row] = await database
      .repository(CalendarEventDerivedTime)
      .findBy({ id: event.id });

    expect(row).toMatchObject({
      durationMinutes: 90,
      startDay: "2026-03-05",
      startHour: 3,
      startLocalDay: "2026-03-04",
      startLocalHour: 22,
      startMonth: 3,
      startQuarter: 1,
      startWeek: 9,
      startWeekday: 4,
      startYear: 2026,
      temporality: "Duration",
    });
  });

  it("follows daylight saving in the local hour, and reports an instant as one", async () => {
    expect.hasAssertions();

    const saved = await database.repository(CalendarEvent).save(
      database.repository(CalendarEvent).create({
        description: "Moon crosses the node",
        end: moment.utc("2026-07-01T04:00:00.000Z"),
        latitude: "40.712800",
        longitude: "-74.006000",
        start: moment.utc("2026-07-01T04:00:00.000Z"),
        summary: "Lunar Node",
        timezone: "America/New_York",
      }),
    );

    const [row] = await database
      .repository(CalendarEventDerivedTime)
      .findBy({ id: saved.id });

    expect(row).toMatchObject({
      durationMinutes: 0,
      startLocalDay: "2026-07-01",
      startLocalHour: 0,
      temporality: "Instant",
    });
  });
});
