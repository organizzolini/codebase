import moment from "moment-timezone";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import {
  CAELUNDAS_DATABASE_MIGRATIONS,
  DATABASE_ENTITIES,
} from "../../data-source.constants";
import { DatabaseModule } from "../../database.module";
import { DatabaseService } from "../../database.service";
import { CalendarEventTag } from "../calendar-events/calendar-event-tag.entity";
import { CalendarEvent } from "../calendar-events/calendar-event.entity";
import { Tag } from "../tags/tag.entity";

import { CalendarEventFact } from "./calendar-event-fact.entity";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { TreeRepository } from "typeorm";

// 🧪 Tests

/** Starting Postgres and running the migrations takes longer than a test. */
const CONTAINER_TIMEOUT_MILLISECONDS = 120_000;

/** The windows each measure is checked over, as `[from, to)` local days. */
const WINDOWS: readonly (readonly [string, string])[] = [
  ["2026-03-01", "2026-04-01"],
  ["2026-03-10", "2026-03-12"],
  ["2026-01-01", "2027-01-01"],
  ["2026-05-01", "2026-06-01"],
];

// Every measure the facts hold, per tag node and for the whole set under a
// null tag, from the raw events and the tag tree: the reference. The phase
// boundary events are left out, as the default scope leaves them.
const RAW_SQL = `
with events as (
    select
        e.id,
        e."start",
        e."end",
        e.start_local_day as day,
        floor(extract(epoch from e."end" - e."start") / 60) as minutes
    from calendar_events as e
    where e.start_local_day >= $1::date and e.start_local_day < $2::date
        and not exists (
            select 1
            from calendar_event_tags as et
            inner join tags_closure as c on et.tag_id = c.descendant_id
            inner join tags as t on c.ancestor_id = t.id
            where et.calendar_event_id = e.id and t."name" in ('Forming', 'Dissolving')
        )
),
carried as (
    select et.calendar_event_id, c.ancestor_id as tag_id
    from calendar_event_tags as et
    inner join tags_closure as c on et.tag_id = c.descendant_id
    group by et.calendar_event_id, c.ancestor_id
),
pairs as (
    select v.id, k.tag_id from events as v inner join carried as k on v.id = k.calendar_event_id
    union all
    select v.id, null from events as v
)
select
    p.tag_id::text as tag_id,
    count(*)::float8 as events,
    count(*) filter (where v."end" = v."start")::float8 as perfective_events,
    count(*) filter (where v."end" > v."start")::float8 as progressive_events,
    coalesce(sum(v.minutes), 0)::float8 as minutes,
    (extract(epoch from min(v."start")) * 1000)::float8 as first_start,
    (extract(epoch from max(v."start")) * 1000)::float8 as last_start,
    count(distinct v.day)::float8 as days
from pairs as p
inner join events as v on p.id = v.id
group by p.tag_id
order by p.tag_id::text collate "C" nulls first`;

// The same, from the facts alone: the day filters of the window, and the
// day-and-tag filters.
const FACTS_SQL = `
with days as (
    select df.id, df.period::text as day
    from filters as df
    inner join "groups" as dg on df.group_id = dg.id and dg.slug = 'day'
    where df.period >= $1::date and df.period < $2::date
),
tag_days as (
    select tf.id, tf.period::text as day, tf.tag_id::text as tag_id
    from filters as tf
    inner join "groups" as tg on tf.group_id = tg.id and tg.slug = 'tag'
    where tf.period >= $1::date and tf.period < $2::date
),
cells as (
    select null::text as tag_id, d.day, m.slug as measure, r.measurement
    from days as d
    inner join calendar_event_facts as r on r.filter_id = d.id
    inner join measures as m on r.measure_id = m.id
    union all
    select d.tag_id, d.day, m.slug, r.measurement
    from tag_days as d
    inner join calendar_event_facts as r on r.filter_id = d.id
    inner join measures as m on r.measure_id = m.id
)
select
    c.tag_id,
    coalesce(sum(c.measurement) filter (where c.measure = 'events'), 0)::float8 as events,
    coalesce(sum(c.measurement) filter (where c.measure = 'perfective-events'), 0)::float8 as perfective_events,
    coalesce(sum(c.measurement) filter (where c.measure = 'progressive-events'), 0)::float8 as progressive_events,
    coalesce(sum(c.measurement) filter (where c.measure = 'duration'), 0)::float8 as minutes,
    min(c.measurement) filter (where c.measure = 'first-start')::float8 as first_start,
    max(c.measurement) filter (where c.measure = 'last-start')::float8 as last_start,
    count(distinct c.day) filter (where c.measure = 'events')::float8 as days
from cells as c
group by c.tag_id
order by c.tag_id collate "C" nulls first`;

type MetricRow = Record<string, null | number | string>;

/**
 * Seeds events across tags, zones and days on a throwaway Postgres migrated by
 * the real migrations, refreshes the facts, and asserts they answer each
 * measure they hold exactly as the raw events do.
 */
describe("metrics facts", () => {
  let database: DatabaseTestingModule;
  let service: DatabaseService;
  let tags: TreeRepository<Tag>;
  const tagged = new Map<string, Tag>();

  /** Saves one event and links it to the named tags. */
  async function addEvent(
    name: string,
    start: string,
    end: string,
    names: readonly string[],
  ): Promise<CalendarEvent> {
    const event = await database.repository(CalendarEvent).save(
      database.repository(CalendarEvent).create({
        end: moment.utc(end),
        latitude: "40.712800",
        longitude: "-74.006000",
        name,
        note: name,
        start: moment.utc(start),
        timezone: "America/New_York",
      }),
    );

    for (const name of names) {
      await database.repository(CalendarEventTag).insert({
        calendarEventId: event.id,
        tagId: tagged.get(name)?.id ?? "",
      });
    }

    return event;
  }

  /** Saves a tag, beneath `parent` when one is named. */
  async function addTag(name: string, parent?: string): Promise<void> {
    const parentTag = tagged.get(parent ?? "");

    tagged.set(
      name,
      await tags.save(
        tags.create(
          parentTag === undefined
            ? { name, slug: name.toLowerCase() }
            : { name, parent: parentTag, slug: name.toLowerCase() },
        ),
      ),
    );
  }

  /** Refreshes the read model. */
  async function refresh(): Promise<void> {
    await service.refreshMetrics(database.dataSource.manager);
  }

  /** The raw and fact rows for a window, whole set first. */
  async function measure(
    from: string,
    to: string,
  ): Promise<{ facts: MetricRow[]; raw: MetricRow[] }> {
    const query = database.dataSource.query.bind(database.dataSource);

    return {
      facts: await query<MetricRow[]>(FACTS_SQL, [from, to]),
      raw: await query<MetricRow[]>(RAW_SQL, [from, to]),
    };
  }

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
    tagged.clear();
    await addTag("Planet");
    await addTag("Mars", "Planet");
    await addTag("Retrograde", "Mars");
    await addTag("Venus", "Planet");
    await addTag("Temporality");
    await addTag("Progressive", "Temporality");
    await addTag("Aspect");
    await addTag("Phase", "Aspect");
    await addTag("Forming", "Phase");
    await addEvent(
      "Mars Retrograde",
      "2026-03-05T03:30:00Z",
      "2026-03-05T05:00:00Z",
      ["Retrograde", "Progressive"],
    );
    await addEvent(
      "Mars Retrograde",
      "2026-03-10T12:00:00Z",
      "2026-03-12T12:00:00Z",
      ["Retrograde", "Progressive"],
    );
    await addEvent(
      "Venus Station",
      "2026-03-10T00:00:00Z",
      "2026-03-10T00:00:00Z",
      ["Venus"],
    );
    await addEvent(
      "Venus Station",
      "2026-03-11T15:00:00Z",
      "2026-03-11T15:00:00Z",
      ["Venus", "Mars"],
    );
    await addEvent(
      "Overlap A",
      "2026-03-10T14:00:00Z",
      "2026-03-10T16:00:00Z",
      ["Mars"],
    );
    await addEvent(
      "Overlap B",
      "2026-03-10T15:00:00Z",
      "2026-03-10T18:00:00Z",
      ["Venus"],
    );
    await addEvent(
      "Forming Moon",
      "2026-03-10T09:00:00Z",
      "2026-03-10T10:00:00Z",
      ["Forming", "Mars"],
    );
    await addEvent(
      "Loose Event",
      "2026-03-11T01:00:00Z",
      "2026-03-11T02:00:00Z",
      [],
    );
    await addEvent(
      "Later Event",
      "2026-04-20T12:00:00Z",
      "2026-04-20T13:30:00Z",
      ["Mars"],
    );
    await refresh();
  });

  afterAll(async () => {
    await database.close();
  });

  it.each(WINDOWS)(
    "answers every measure from the facts as the raw events do over %s to %s",
    async (from, to) => {
      expect.hasAssertions();

      const { facts, raw } = await measure(from, to);

      expect(facts).toStrictEqual(raw);
    },
  );

  it("measures a non-empty window, so the comparison is not vacuous", async () => {
    expect.hasAssertions();

    const { raw } = await measure("2026-03-01", "2026-04-01");

    expect(raw[0]).toMatchObject({
      days: 4,
      events: 7,
      perfective_events: 2,
      progressive_events: 5,
    });
    expect(raw.length).toBeGreaterThan(5);
  });

  it("leaves out the events tagged as a phase forming or dissolving, as the default scope does", async () => {
    expect.hasAssertions();

    const [row] = await database.dataSource.query<{ events: number }[]>(
      `select r.measurement as events
      from calendar_event_facts r
      join measures m on m.id = r.measure_id
      join filters f on f.id = r.filter_id
      where m.slug = 'events' and f.period = '2026-03-10' and f.tag_id is null`,
    );

    expect(row?.events).toBe(4);
  });

  it("seeds the dimensions, their roll-up graph and a group for each", async () => {
    expect.hasAssertions();

    const names = async (sql: string): Promise<string[]> => {
      const rows = await database.dataSource.query<{ name: string }[]>(sql);

      return rows.map(({ name }) => name);
    };

    await expect(
      names(`select slug as name from dimensions order by slug`),
    ).resolves.toStrictEqual([
      "day",
      "month",
      "name",
      "quarter",
      "tag",
      "week",
      "year",
    ]);
    await expect(
      names(
        `select s.slug || '>' || t.slug as name
        from dimension_edges e
        join dimensions s on s.id = e.source_node
        join dimensions t on t.id = e.target_node order by 1`,
      ),
    ).resolves.toStrictEqual([
      "day>month",
      "day>week",
      "month>quarter",
      "quarter>year",
    ]);
    await expect(
      names(
        `select g.slug || '=' || string_agg(d.slug, '+' order by d.slug) as name
        from groups g
        join group_dimensions gd on gd.group_id = g.id
        join dimensions d on d.id = gd.dimension_id
        group by g.slug order by g.slug`,
      ),
    ).resolves.toStrictEqual([
      "day=day",
      "month=month",
      "name=name",
      "quarter=quarter",
      "tag=tag",
      "week=week",
      "year=year",
    ]);
  });

  it("holds no scope filter: the facts are the default scope's by definition", async () => {
    expect.hasAssertions();

    const [row] = await database.dataSource.query<{ roots: string }[]>(
      `select count(*) as roots from filters where slug is not null`,
    );

    expect(row?.roots).toBe("0");
    expect(
      database.dataSource.getMetadata(CalendarEventFact).comment,
    ).toContain("Forming and Dissolving");
  });

  it("holds one measure at one filter a row, in the unit of its measure", async () => {
    expect.hasAssertions();

    const columns = await database.dataSource.query<
      { name: string; type: string }[]
    >(
      `select column_name as name, data_type as type
      from information_schema.columns
      where table_name = 'calendar_event_facts' and table_schema = current_schema()
      order by column_name`,
    );
    const [duplicates] = await database.dataSource.query<{ count: string }[]>(
      `select count(*) from (
        select filter_id, measure_id from calendar_event_facts group by 1, 2 having count(*) > 1
      ) d`,
    );

    expect(columns).toStrictEqual([
      { name: "filter_id", type: "uuid" },
      { name: "measure_id", type: "uuid" },
      { name: "measurement", type: "double precision" },
    ]);
    expect(duplicates?.count).toBe("0");
  });

  it("holds each event's tags as two sorted arrays, a row for every event", async () => {
    expect.hasAssertions();

    const [row] = await database.dataSource.query<
      { events: string; rows: string }[]
    >(
      `select (select count(*) from calendar_events) as events,
        (select count(*) from calendar_event_tag_sets) as rows`,
    );
    const names = await database.dataSource.query<{ name: string }[]>(
      `select a.attname as name from pg_attribute a
       where a.attrelid = 'calendar_event_tag_sets'::regclass and a.attnum > 0
       order by a.attname`,
    );

    expect(row?.rows).toBe(row?.events);
    expect(names.map(({ name }) => name)).toStrictEqual([
      "ancestor_tag_ids",
      "calendar_event_id",
      "tag_ids",
    ]);
  });

  it("indexes the tag sets by event and by each array", async () => {
    expect.hasAssertions();

    const rows = await database.dataSource.query<
      { name: string; unique: boolean }[]
    >(
      `select c.relname as name, x.indisunique as "unique"
       from pg_index x
       join pg_class c on c.oid = x.indexrelid
       where x.indrelid = 'calendar_event_tag_sets'::regclass order by c.relname`,
    );

    expect(rows).toStrictEqual([
      { name: "calendar_event_tag_sets_ancestor_tag_ids", unique: false },
      { name: "calendar_event_tag_sets_calendar_event_id", unique: true },
      { name: "calendar_event_tag_sets_tag_ids", unique: false },
    ]);
  });

  it("follows the events: a refresh drops a removed event and its stale rows", async () => {
    expect.hasAssertions();

    await database.dataSource.query(
      "delete from calendar_events where name = 'Later Event'",
    );
    await refresh();

    const { facts, raw } = await measure("2026-01-01", "2027-01-01");

    expect(facts).toStrictEqual(raw);
    await expect(
      database.dataSource.query<unknown[]>(
        `select 1 from filters where period = '2026-04-20'`,
      ),
    ).resolves.toHaveLength(0);
  });

  it("declares the row estimate of expand_keys as 2, expand_tags as 6 and window_events as 1500", async () => {
    expect.hasAssertions();

    const estimate = async (call: string): Promise<number> => {
      const [row] = await database.dataSource.query<
        { "QUERY PLAN": { Plan: Record<string, number> }[] }[]
      >(`explain (format json) select * from ${call}`);

      return row?.["QUERY PLAN"][0]?.Plan["Plan Rows"] ?? 0;
    };

    await expect(estimate("expand_keys(array['a'])")).resolves.toBe(2);
    await expect(estimate("expand_tags(array[]::uuid[])")).resolves.toBe(6);
    await expect(estimate("window_events(now(), now())")).resolves.toBe(1500);
  });

  it("lists the events that overlap a period with their tags, an event that ends at its start included", async () => {
    expect.hasAssertions();

    const rows = await database.dataSource.query<
      { name: string; tag_ids: string[] }[]
    >(
      `select "name", tag_ids from window_events('2026-03-10T00:00:00Z', '2026-03-10T00:00:01Z') order by "name"`,
    );

    expect(rows.map(({ name }) => name)).toStrictEqual(["Venus Station"]);
    expect(rows.every(({ tag_ids }) => tag_ids.length > 0)).toBe(true);
  });

  it("expands an empty key array to one null row and a filled one to a row per key", async () => {
    expect.hasAssertions();

    const keys = async (list: string): Promise<(null | string)[]> => {
      const rows = await database.dataSource.query<{ key: null | string }[]>(
        `select key from expand_keys(${list}) order by key`,
      );

      return rows.map(({ key }) => key);
    };

    await expect(keys("array[]::text[]")).resolves.toStrictEqual([null]);
    await expect(keys("array['a', 'b']")).resolves.toStrictEqual(["a", "b"]);
  });

  it("expands a tag id array to a row per id and an empty one to none", async () => {
    expect.hasAssertions();

    const first = "00000000-0000-0000-0000-000000000001";
    const second = "00000000-0000-0000-0000-000000000002";
    const ids = async (list: string): Promise<string[]> => {
      const rows = await database.dataSource.query<{ id: string }[]>(
        `select id from expand_tags(${list}) order by id`,
      );

      return rows.map(({ id }) => id);
    };

    await expect(
      ids(`array['${second}', '${first}']::uuid[]`),
    ).resolves.toStrictEqual([first, second]);
    await expect(ids("array[]::uuid[]")).resolves.toStrictEqual([]);
  });

  it("refreshes again with nothing changed", async () => {
    expect.hasAssertions();

    await expect(refresh()).resolves.toBeUndefined();
  });
});
