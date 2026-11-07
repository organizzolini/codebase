import moment from "moment-timezone";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import { CaelundasDatabaseModule } from "./caelundas-database.module";
import { CaelundasDatabaseService } from "./caelundas-database.service";
import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_MIGRATIONS,
} from "./data-source.constants";
import { CalendarEventDerivedTime } from "./entities/calendar-event-derived-time.entity";
import { CalendarEventTagNode } from "./entities/calendar-event-tag-node.entity";
import { CalendarEventTag } from "./entities/calendar-event-tag.entity";
import { CalendarEvent } from "./entities/calendar-event.entity";
import { TagNode } from "./entities/tag-node.entity";
import { Tag } from "./entities/tag.entity";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { TreeRepository } from "typeorm";

// 🧪 Tests

/** Starting Postgres and running the migration takes longer than a test. */
const CONTAINER_TIMEOUT_MILLISECONDS = 120_000;

/**
 * Rebuilds the read model on a throwaway Postgres container migrated by the
 * project's real migration: base rows go in through the entities, the refresh
 * runs, and the derived tag tables and the derived-times view are asserted.
 */
describe(CaelundasDatabaseService, () => {
  let database: DatabaseTestingModule;
  let service: CaelundasDatabaseService;
  let tags: TreeRepository<Tag>;
  let mars: Tag;
  let planet: Tag;
  let retrograde: Tag;
  let event: CalendarEvent;

  beforeAll(async () => {
    database = await startDatabaseTestingModule({
      database: CaelundasDatabaseModule,
      entities: [...CAELUNDAS_DATABASE_ENTITIES],
      migrations: [...CAELUNDAS_DATABASE_MIGRATIONS],
      project: "caelundas",
    });
    service = database.module.get(CaelundasDatabaseService);
    tags = database.dataSource.getTreeRepository(Tag);
  }, CONTAINER_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    await database.dataSource.query(
      "truncate calendar_event_tags, calendar_events, tags, tags_closure, tag_nodes, calendar_event_tag_nodes cascade",
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

  it("fills tag_nodes with each tag's depth, root and path", async () => {
    expect.hasAssertions();

    await service.refreshReadModel(database.dataSource.manager);

    const nodes = await database
      .repository(TagNode)
      .find({ order: { depth: "ASC" } });

    expect(
      nodes.map(({ depth, id, name, path, rootId }) => ({
        depth,
        id,
        name,
        path,
        rootId,
      })),
    ).toStrictEqual([
      {
        depth: 0,
        id: planet.id,
        name: "Planet",
        path: "Planet",
        rootId: planet.id,
      },
      {
        depth: 1,
        id: mars.id,
        name: "Mars",
        path: "Planet / Mars",
        rootId: planet.id,
      },
      {
        depth: 2,
        id: retrograde.id,
        name: "Retrograde",
        path: "Planet / Mars / Retrograde",
        rootId: planet.id,
      },
    ]);
  });

  it("gives an event a row for every tag it carries and every ancestor, marking the direct one", async () => {
    expect.hasAssertions();

    await service.refreshReadModel(database.dataSource.manager);

    const rows = await database
      .repository(CalendarEventTagNode)
      .find({ order: { tagDepth: "ASC" } });

    expect(
      rows.map(({ calendarEventId, isDirect, tagDepth, tagName, tagPath }) => ({
        calendarEventId,
        isDirect,
        tagDepth,
        tagName,
        tagPath,
      })),
    ).toStrictEqual([
      {
        calendarEventId: event.id,
        isDirect: false,
        tagDepth: 0,
        tagName: "Planet",
        tagPath: "Planet",
      },
      {
        calendarEventId: event.id,
        isDirect: false,
        tagDepth: 1,
        tagName: "Mars",
        tagPath: "Planet / Mars",
      },
      {
        calendarEventId: event.id,
        isDirect: true,
        tagDepth: 2,
        tagName: "Retrograde",
        tagPath: "Planet / Mars / Retrograde",
      },
    ]);
  });

  it("replaces what it built before, so a removed tag leaves no stale row", async () => {
    expect.hasAssertions();

    await service.refreshReadModel(database.dataSource.manager);
    await database
      .repository(CalendarEventTag)
      .delete({ calendarEventId: event.id });
    await service.refreshReadModel(database.dataSource.manager);

    await expect(
      database.repository(CalendarEventTagNode).count(),
    ).resolves.toBe(0);
    await expect(database.repository(TagNode).count()).resolves.toBe(3);
  });

  it("runs inside the caller's transaction, so a rollback keeps the earlier read model", async () => {
    expect.hasAssertions();

    await service.refreshReadModel(database.dataSource.manager);
    await database
      .repository(CalendarEventTag)
      .delete({ calendarEventId: event.id });

    await database.dataSource.manager
      .transaction(async (manager) => {
        await service.refreshReadModel(manager);

        throw new Error("roll back");
      })
      .catch(() => {});

    await expect(
      database.repository(CalendarEventTagNode).count(),
    ).resolves.toBe(3);
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
