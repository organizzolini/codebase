import moment from "moment-timezone";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import {
  CAELUNDAS_DATABASE_MIGRATIONS,
  DATABASE_ENTITIES,
} from "./data-source.constants";
import { DatabaseModule } from "./database.module";
import { DatabaseService } from "./database.service";
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
 * runs, and the filters, the facts, the tag sets and the inline local-time
 * expressions are asserted.
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
    planet = await tags.save(tags.create({ name: "Planet", slug: "planet" }));
    mars = await tags.save(
      tags.create({ name: "Mars", parent: planet, slug: "mars" }),
    );
    retrograde = await tags.save(
      tags.create({ name: "Retrograde", parent: mars, slug: "retrograde" }),
    );
    event = await database.repository(CalendarEvent).save(
      database.repository(CalendarEvent).create({
        end: moment.utc("2026-03-05T05:00:00.000Z"),
        latitude: "40.712800",
        longitude: "-74.006000",
        name: "Mars Retrograde",
        note: "Mars stations retrograde",
        start: moment.utc("2026-03-05T03:30:00.000Z"),
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

  /** Refreshes the read model. */
  async function refresh(): Promise<void> {
    await service.refreshMetrics(database.dataSource.manager);
  }

  /** The tags that have a day-and-tag filter, sorted. */
  async function readTagFilters(): Promise<string[]> {
    const rows = await database.dataSource.query<{ tag_id: string }[]>(
      `select distinct f.tag_id from filters f join "groups" g on g.id = f.group_id where g.slug = 'tag' order by f.tag_id`,
    );

    return rows.map(({ tag_id }) => tag_id);
  }

  /** How many day-and-tag filters there are. */
  async function countTagDays(): Promise<number> {
    const [row] = await database.dataSource.query<{ count: string }[]>(
      `select count(*) from filters f join "groups" g on g.id = f.group_id where g.slug = 'tag'`,
    );

    return Number(row?.count);
  }

  /** The measurement of one measure on 4 March for the whole set, or for the tag given. */
  async function readMeasurement(
    measure: string,
    tagId: null | string,
  ): Promise<null | number> {
    const rows = await database.dataSource.query<{ measurement: number }[]>(
      `select r.measurement
      from calendar_event_facts r
      join measures m on m.id = r.measure_id
      join filters f on f.id = r.filter_id
      where m.slug = $1 and f.period = '2026-03-04' and f.tag_id is not distinct from $2::uuid`,
      [measure, tagId],
    );

    return rows[0]?.measurement ?? null;
  }

  it("gives each day a filter, pinned by its period", async () => {
    expect.hasAssertions();

    await refresh();

    const rows = await database.dataSource.query<
      { group: string; parent_id: null | string; period: string }[]
    >(
      `select g.slug as "group", f.parent_id, f.period::text
      from filters f join "groups" g on g.id = f.group_id
      where g.slug = 'day'`,
    );

    expect(rows).toStrictEqual([
      { group: "day", parent_id: null, period: "2026-03-04" },
    ]);
  });

  it("gives each tag a filter on the day that mirrors the tag tree and copies nothing from it", async () => {
    expect.hasAssertions();

    await refresh();

    await expect(readTagFilters()).resolves.toStrictEqual(
      [planet.id, mars.id, retrograde.id].toSorted(),
    );

    const rows = await database.dataSource.query<
      {
        name: null | string;
        parent_group: string;
        parent_tag: null | string;
        tag_id: string;
      }[]
    >(
      `select f.tag_id, f.name, g.slug as parent_group, p.tag_id as parent_tag
      from filters f
      join filters p on p.id = f.parent_id
      join "groups" g on g.id = p.group_id
      where f.tag_id is not null`,
    );
    const parents = new Map(rows.map((row) => [row.tag_id, row]));

    expect(parents.get(planet.id)).toMatchObject({
      parent_group: "day",
      parent_tag: null,
    });
    expect(parents.get(mars.id)?.parent_tag).toBe(planet.id);
    expect(parents.get(retrograde.id)?.parent_tag).toBe(mars.id);
    expect(rows.every(({ name }) => name === null)).toBe(true);
  });

  it("gives each tag with an event one filter a day", async () => {
    expect.hasAssertions();

    await refresh();

    await expect(countTagDays()).resolves.toBe(3);
  });

  it("measures an ancestor tag with every event beneath it", async () => {
    expect.hasAssertions();

    await refresh();

    await expect(readMeasurement("events", null)).resolves.toBe(1);
    await expect(readMeasurement("events", planet.id)).resolves.toBe(1);
    await expect(readMeasurement("duration", planet.id)).resolves.toBe(90);
  });

  it("writes no row for a measure that is zero, and none for a measure that does not merge", async () => {
    expect.hasAssertions();

    await refresh();

    await expect(
      readMeasurement("perfective-events", null),
    ).resolves.toBeNull();
    await expect(readMeasurement("progressive-events", null)).resolves.toBe(1);

    const rows = await database.dataSource.query<{ slug: string }[]>(
      `select distinct m.slug
      from calendar_event_facts r join measures m on m.id = r.measure_id
      order by m.slug`,
    );

    expect(rows.map(({ slug }) => slug)).toStrictEqual([
      "duration",
      "events",
      "first-start",
      "last-start",
      "progressive-events",
    ]);
  });

  it("keeps an instant as epoch milliseconds", async () => {
    expect.hasAssertions();

    await refresh();

    await expect(readMeasurement("first-start", null)).resolves.toBe(
      Date.parse("2026-03-05T03:30:00.000Z"),
    );
  });

  it("gives the tag sets the tag the event was given, and apart from it every ancestor of that tag", async () => {
    expect.hasAssertions();

    await refresh();

    const [row] = await database.dataSource.query<
      { ancestor_tag_ids: string[]; tag_ids: string[] }[]
    >(
      `select tag_ids, ancestor_tag_ids from calendar_event_tag_sets where calendar_event_id = $1`,
      [event.id],
    );

    expect(row?.tag_ids).toStrictEqual([retrograde.id]);
    expect(row?.ancestor_tag_ids.toSorted()).toStrictEqual(
      [planet.id, mars.id].toSorted(),
    );
  });

  it("matches an event by a tag it carries or any ancestor of one, with tag_ids || ancestor_tag_ids", async () => {
    expect.hasAssertions();

    await refresh();

    const matching = async (tagId: string): Promise<number> => {
      const rows = await database.dataSource.query<unknown[]>(
        `select 1 from calendar_event_tag_sets where (tag_ids || ancestor_tag_ids) @> array[$1::uuid]`,
        [tagId],
      );

      return rows.length;
    };

    await expect(matching(planet.id)).resolves.toBe(1);
    await expect(matching(mars.id)).resolves.toBe(1);
    await expect(matching(retrograde.id)).resolves.toBe(1);
  });

  it("replaces what it built before, so a removed tag leaves no stale day filter or fact", async () => {
    expect.hasAssertions();

    await refresh();
    await database
      .repository(CalendarEventTag)
      .delete({ calendarEventId: event.id });
    await refresh();

    await expect(countTagDays()).resolves.toBe(0);
    await expect(readMeasurement("events", null)).resolves.toBe(1);
    await expect(readMeasurement("events", retrograde.id)).resolves.toBeNull();
  });

  it("drops a day that lost its events, with the tags and facts beneath it", async () => {
    expect.hasAssertions();

    await refresh();
    await database.repository(CalendarEvent).delete({ id: event.id });
    await refresh();

    const [counts] = await database.dataSource.query<
      { facts: string; filters: string }[]
    >(
      `select (select count(*) from calendar_event_facts) as facts,
        (select count(*) from filters) as filters`,
    );

    expect(counts).toStrictEqual({ facts: "0", filters: "0" });
  });

  it("runs inside the caller's transaction, so a rollback keeps the earlier facts", async () => {
    expect.hasAssertions();

    await refresh();
    await database
      .repository(CalendarEventTag)
      .delete({ calendarEventId: event.id });

    await database.dataSource.manager
      .transaction(async (manager) => {
        await service.refreshMetrics(manager);

        throw new Error("roll back");
      })
      .catch(() => {});

    await expect(countTagDays()).resolves.toBe(3);
  });

  it("keeps the filters, and their ids, when a refresh finds nothing changed", async () => {
    expect.hasAssertions();

    const ids = async (): Promise<string[]> => {
      const rows = await database.dataSource.query<{ id: string }[]>(
        `select id from filters order by id`,
      );

      return rows.map(({ id }) => id);
    };

    await refresh();
    const before = await ids();
    await refresh();

    await expect(ids()).resolves.toStrictEqual(before);
    expect(before).toHaveLength(4);
  });

  it("leaves a phase boundary event out of the facts, the default scope's way", async () => {
    expect.hasAssertions();

    const forming = await tags.save(
      tags.create({
        name: "Forming",
        parent: await tags.save(
          tags.create({
            name: "Phase",
            parent: await tags.save(
              tags.create({ name: "Aspect", slug: "aspect" }),
            ),
            slug: "phase",
          }),
        ),
        slug: "forming",
      }),
    );
    await database
      .repository(CalendarEventTag)
      .insert({ calendarEventId: event.id, tagId: forming.id });
    await refresh();

    await expect(countTagDays()).resolves.toBe(0);
    await expect(readMeasurement("events", null)).resolves.toBeNull();
  });

  it("computes an event's local day, hour, minutes and temporality inline, in the zone it names", async () => {
    expect.hasAssertions();

    const [row] = await database.dataSource.query<Record<string, unknown>[]>(
      `select
        (e."start" at time zone e.timezone)::date::text as local_day,
        extract(hour from e."start" at time zone e.timezone)::int as local_hour,
        extract(dow from e."start" at time zone e.timezone)::int as local_weekday,
        floor(extract(epoch from e."end" - e."start") / 60)::int as duration_minutes,
        case when e."start" = e."end" then 'Instant' else 'Duration' end as temporality
      from calendar_events as e where e.id = $1`,
      [event.id],
    );

    expect(row).toStrictEqual({
      duration_minutes: 90,
      local_day: "2026-03-04",
      local_hour: 22,
      local_weekday: 3,
      temporality: "Duration",
    });
  });

  it("follows daylight saving in the inline local hour, and reports an instant as one", async () => {
    expect.hasAssertions();

    const saved = await database.repository(CalendarEvent).save(
      database.repository(CalendarEvent).create({
        end: moment.utc("2026-07-01T04:00:00.000Z"),
        latitude: "40.712800",
        longitude: "-74.006000",
        name: "Lunar Node",
        note: "Moon crosses the node",
        start: moment.utc("2026-07-01T04:00:00.000Z"),
        timezone: "America/New_York",
      }),
    );

    const [row] = await database.dataSource.query<Record<string, unknown>[]>(
      `select
        (e."start" at time zone e.timezone)::date::text as local_day,
        extract(hour from e."start" at time zone e.timezone)::int as local_hour,
        case when e."start" = e."end" then 'Instant' else 'Duration' end as temporality
      from calendar_events as e where e.id = $1`,
      [saved.id],
    );

    expect(row).toStrictEqual({
      local_day: "2026-07-01",
      local_hour: 0,
      temporality: "Instant",
    });
  });
});
