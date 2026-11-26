import { z } from "zod";

import { TAG_INFO_SQL } from "../../../filtering/modules/query-building/event-filter-sql.constants";
import {
  FACTS_EVENT_COLUMN_SQL,
  FACTS_EVENT_SOURCE_SQL,
} from "../facts/event-metrics-facts.constants";

import type {
  RollupCalendarKey,
  RollupTarget,
} from "./event-metrics-rollup.types";

// ♟️ Constants

/** The event row columns a rollup row has, besides the two starts. */
const ROLLUP_EVENT_COLUMNS = [
  "events",
  "perfective_events",
  "progressive_events",
] as const;

/** An event row with a rollup row's columns, the starts in milliseconds. */
const EVENT_COLUMNS_SQL = `f."day", f.tag_ids, f.ancestor_tag_ids, f.duration_minutes,
      ${[
        ...ROLLUP_EVENT_COLUMNS.map(
          (column) => `${FACTS_EVENT_COLUMN_SQL[column]} as ${column}`,
        ),
        `(extract(epoch from f."start") * 1000)::float8 as first_start`,
        `(extract(epoch from f."start") * 1000)::float8 as last_start`,
      ].join(",\n      ")}`;

/** The group `slug` names. */
const group = (slug: string): string =>
  `(select id from "groups" where slug = '${slug}')`;

/** The events that start before a period and reach into it. */
const CROSSING_SQL = `x as not materialized (
    select p.period, ${EVENT_COLUMNS_SQL}
    from periods p
    join ${FACTS_EVENT_SOURCE_SQL} f on {eventRows} and f."start" < p.period_start and f."end" >= p.period_start
  )`;

/** The periods, with the local days they start and stop on. */
const PERIODS_SQL = `periods (period, period_start, from_day, to_day) as (
    select p.period, p.period_start, (p.period_start at time zone {zone})::date, (p.period_end at time zone {zone})::date
    from (values {periods}) as p (period, period_start, period_end)
  )`;

/** Event row `{e}` as a rollup's single row. */
const EVENT_ROW_SQL = `{e}.events, {e}.perfective_events, {e}.progressive_events, {e}.duration_minutes,
      {e}.first_start, {e}.last_start`;

/** The events of a tag level with none of the root's tags. */
const UNTAGGED_SQL = `where not f.tag_ids && (
      select coalesce(array_agg(tc.descendant_id), '{}'::uuid[])
      from tags_closure tc
      where tc.ancestor_id = {root}::uuid and tc.descendant_id <> {root}::uuid
    )`;

// A measure is a row of its own, so each is pivoted back to a column, summed
// where it adds up and kept by `min` or `max` where it is an instant.
/** The facts `r` of one cell, as columns. */
const PIVOT_SQL = `coalesce(sum(r.measurement) filter (where m.slug = 'events'), 0) as events,
      coalesce(sum(r.measurement) filter (where m.slug = 'perfective-events'), 0) as perfective_events,
      coalesce(sum(r.measurement) filter (where m.slug = 'progressive-events'), 0) as progressive_events,
      coalesce(sum(r.measurement) filter (where m.slug = 'duration'), 0) as duration_minutes,
      min(r.measurement) filter (where m.slug = 'first-start') as first_start,
      max(r.measurement) filter (where m.slug = 'last-start') as last_start`;

/** The events of the periods in no group of a tag level. */
export const ROLLUP_UNTAGGED_SQL = `,
  c as not materialized (
    select p.period, ${EVENT_COLUMNS_SQL}
    from periods p
    join ${FACTS_EVENT_SOURCE_SQL} f on {eventRows} and f."day" >= p.from_day and f."day" < p.to_day
    ${UNTAGGED_SQL}
    union all
    select p.period, ${EVENT_COLUMNS_SQL}
    from periods p
    join ${FACTS_EVENT_SOURCE_SQL} f on {eventRows} and f."start" < p.period_start and f."end" >= p.period_start
    ${UNTAGGED_SQL}
  )`;

/** The rows of the group no tag names, one an event. */
export const ROLLUP_UNTAGGED_ROWS_SQL = `
    union all
    select c.period, c."day", null::uuid,
      ${EVENT_ROW_SQL.replaceAll("{e}", "c")}
    from c`;

/** The metrics' columns over a rollup row `r` or crossing event `x`. */
const ROLLUP_ROWS_SQL = `
    select r.period, r."day"{rollupExtra},
      ${EVENT_ROW_SQL.replaceAll("{e}", "r")}
    from ({cells}) r
    union all
    select x.period, x."day"{crossingExtra},
      ${EVENT_ROW_SQL.replaceAll("{e}", "x")}
    from x{crossingJoin}{untaggedRows}`;

/** The window's rows: the facts', and the crossing events. */
export const ROLLUP_FACTS_SQL = `
  with ${TAG_INFO_SQL},
  ${PERIODS_SQL},
  ${CROSSING_SQL}{untagged},
  w as not materialized (${ROLLUP_ROWS_SQL}
  ),
  totals as (
    select w.period{group}{totals}
    from w
    group by w.period{group}
  )
  select t.period{columns}{metrics}
  from totals t{joins}
`;

/** One row a day: the whole set's facts, at the day filters. */
export const ROLLUP_TOTAL_CELLS_SQL = `
    select p.period, df.period as "day", ${PIVOT_SQL}
    from periods p
    join filters df on df.group_id = ${group("day")}
      and df.period >= p.from_day and df.period < p.to_day
    join calendar_event_facts r on r.filter_id = df.id
    join measures m on m.id = r.measure_id
    group by p.period, df.period`;

/** One row a day and tag node, from the tag filters. */
export const ROLLUP_TAG_CELLS_SQL = `
    select p.period, tf.period as "day", tf.tag_id, ${PIVOT_SQL}
    from periods p
    join filters tf on tf.group_id = ${group("tag")}
      and tf.period >= p.from_day and tf.period < p.to_day
      and tf.tag_id in (select ct.id from tags ct where ct.parent_id = {root}::uuid)
    join calendar_event_facts r on r.filter_id = tf.id
    join measures m on m.id = r.measure_id
    group by p.period, tf.period, tf.tag_id`;

/** Calendar fields the day rollup groups by, with their keys. */
export const ROLLUP_CALENDAR_KEYS: ReadonlyMap<string, RollupCalendarKey> =
  new Map([
    ["day", { column: "day", key: `t."day"::text`, source: `{r}."day"` }],
    [
      "month",
      {
        column: "month",
        key: `substr(t."month"::text, 1, 7)`,
        source: `date_trunc('month', {r}."day"::timestamp)::date`,
      },
    ],
    [
      "quarter",
      {
        column: "quarter",
        key: `substr(t."quarter"::text, 1, 4) || '-Q' || extract(quarter from t."quarter")::integer::text`,
        source: `date_trunc('quarter', {r}."day"::timestamp)::date`,
      },
    ],
    [
      "year",
      {
        column: "year",
        key: `t."year"::text`,
        source: `extract(year from {r}."day")::integer`,
      },
    ],
  ]);

/** The group columns of a calendar field, by its key. */
export const ROLLUP_CALENDAR_COLUMNS_SQL = `,
    '/0:' || {key} as id, ''::text as parent_id, {key} as "key", null::text as label, null::text as "path", null::text as "rank"`;

/** The group columns of a tag node. */
export const ROLLUP_TAG_COLUMNS_SQL = `,
    '/0:' || coalesce(t.tag_id::text, '') as id, ''::text as parent_id, t.tag_id::text as "key", tn.tag_name as label, tn.tag_path as "path", tn.tag_rank as "rank"`;

/** Joins a tag's node to its group. */
export const ROLLUP_TAG_JOIN_SQL = ` left join tag_info tn on tn.tag_id = t.tag_id`;

/** Explodes a crossing event into the tag nodes of a level. */
export const ROLLUP_TAG_CROSSING_SQL = ` cross join lateral (
      select distinct a.id from unnest(x.tag_ids || x.ancestor_tag_ids) as a (id)
    ) as n (tag_id)
      join tags tn on tn.id = n.tag_id and tn.parent_id = {root}::uuid`;

/** The zone every event shares, when the periods align to its days. */
export const ROLLUP_GUARD_SQL = `
  with zone as (
    select min(e.timezone) as name
    from (select distinct timezone from calendar_events) e
    having count(*) = 1
  )
  select z.name as timezone
  from zone z
  where not exists (
    select 1
    from (values {periods}) as p (period, period_start, period_end)
    where not (
      p.period_start < p.period_end
      and (p.period_start at time zone z.name)::time = time '00:00'
      and (p.period_end at time zone z.name)::time = time '00:00'
    )
  )
`;

/** The whole set: every event of the day rollup. */
export const ROLLUP_TOTAL_TARGET: RollupTarget = {
  cells: ROLLUP_TOTAL_CELLS_SQL,
  columns: "",
  crossingExtra: "",
  crossingJoin: "",
  group: null,
  join: "",
  rollupExtra: "",
  root: null,
  untagged: "",
  untaggedRows: "",
};

/** The tag nodes one level beneath a root. */
export const ROLLUP_TAG_TARGET: RollupTarget = {
  cells: ROLLUP_TAG_CELLS_SQL,
  columns: ROLLUP_TAG_COLUMNS_SQL,
  crossingExtra: ", n.tag_id",
  crossingJoin: ROLLUP_TAG_CROSSING_SQL,
  group: "tag_id",
  join: ROLLUP_TAG_JOIN_SQL,
  rollupExtra: ", r.tag_id",
  root: null,
  untagged: ROLLUP_UNTAGGED_SQL,
  untaggedRows: ROLLUP_UNTAGGED_ROWS_SQL,
};

/** The zone the guard found. */
export const rollupZoneSchema = z.object({ timezone: z.string() });
