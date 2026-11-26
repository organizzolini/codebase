import { z } from "zod";

import { TAG_INFO_SQL } from "../../../filtering/modules/query-building/event-filter-sql.constants";
import { EventMetric } from "../inputs/event-metric.entities";

import type {
  RollupCalendarKey,
  RollupFamily,
  RollupTarget,
} from "./event-metrics-rollup.types";

// ♟️ Constants

/** The events that start before a period and reach into it. */
const CROSSING_SQL = `x as not materialized (
    select p.period, f.*
    from periods p
    join calendar_event_facts f on {eventRows} and f.extent @> p.period_start and f."start" < p.period_start
  )`;

/** The periods, with the local days they start and stop on. */
const PERIODS_SQL = `periods (period, period_start, from_day, to_day) as (
    select p.period, p.period_start, (p.period_start at time zone {zone})::date, (p.period_end at time zone {zone})::date
    from (values {periods}) as p (period, period_start, period_end)
  )`;

/** Event row `{e}` as a rollup's single row. */
const EVENT_ROW_SQL = `{e}.events, {e}.instants, {e}.spans, {e}.duration_seconds, {e}.progressive_seconds,
      {e}.first_start, {e}.last_start, {e}.covered_range, {e}.span_duration_seconds, {e}.direct_tag_ids`;

/** The events of a tag level with none of the root's tags. */
const UNTAGGED_SQL = `where not f.tag_ids && (
      select coalesce(array_agg(tc.descendant_id), '{}'::uuid[])
      from tags_closure tc
      where tc.ancestor_id = {root}::uuid and tc.descendant_id <> {root}::uuid
    )`;

/** The events of the periods in no group of a tag level. */
export const ROLLUP_UNTAGGED_SQL = `,
  c as not materialized (
    select p.period, f.*
    from periods p
    join calendar_event_facts f on {eventRows} and f.local_day >= p.from_day and f.local_day < p.to_day
    ${UNTAGGED_SQL}
    union all
    select p.period, f.*
    from periods p
    join calendar_event_facts f on {eventRows} and f.extent @> p.period_start and f."start" < p.period_start
    ${UNTAGGED_SQL}
  )`;

/** The rows of the group no tag names, one an event. */
export const ROLLUP_UNTAGGED_ROWS_SQL = `
    union all
    select c.period, c.local_day, null::uuid,
      ${EVENT_ROW_SQL.replaceAll("{e}", "c")}
    from c`;

/** The metrics' columns over a rollup row `r` or crossing event `x`. */
const ROLLUP_ROWS_SQL = `
    select p.period, r.local_day{rollupExtra},
      ${EVENT_ROW_SQL.replaceAll("{e}", "r")}
    from calendar_event_facts r
    join periods p on r.local_day >= p.from_day and r.local_day < p.to_day
    where {rollupRows}{restrict}
    union all
    select x.period, x.local_day{crossingExtra},
      ${EVENT_ROW_SQL.replaceAll("{e}", "x")}
    from x{crossingJoin}{untaggedRows}`;

/** The window's rows: the rollup's, and the crossing events. */
export const ROLLUP_FACTS_SQL = `
  with ${TAG_INFO_SQL},
  ${PERIODS_SQL},
  ${CROSSING_SQL}{untagged},
  w as not materialized (${ROLLUP_ROWS_SQL}
  ),
  totals as (
    select w.period{group}, sum(w.events) as events, sum(w.instants) as instants, sum(w.spans) as spans,
      sum(w.duration_seconds) as duration_seconds, sum(w.progressive_seconds) as progressive_seconds,
      min(w.first_start) as first_start, max(w.last_start) as last_start,
      count(distinct w.local_day) as days{covered}
    from w
    group by w.period{group}
  ){families}
  select t.period{columns}{metrics}
  from totals t{joins}
`;

/** The union of the groups' spans, in minutes. */
export const ROLLUP_COVERED_SQL = `,
      (select coalesce(sum(extract(epoch from upper(g) - lower(g))), 0) / 60 from unnest(range_agg(w.covered_range)) g) as covered`;

/** The metrics the rollups answer, by the columns they read. */
export const ROLLUP_METRIC_SQL: Readonly<Partial<Record<EventMetric, string>>> =
  {
    [EventMetric.AVERAGE_DURATION_MINUTES]: `d.average`,
    [EventMetric.COVERED_MINUTES]: `t.covered`,
    [EventMetric.DAYS_WITH_EVENTS]: `t.days`,
    [EventMetric.EVENTS]: `t.events`,
    [EventMetric.FIRST_START]: `extract(epoch from t.first_start) * 1000`,
    [EventMetric.INSTANTS]: `t.instants`,
    [EventMetric.LAST_START]: `extract(epoch from t.last_start) * 1000`,
    [EventMetric.LONGEST_DURATION_MINUTES]: `d.longest`,
    [EventMetric.MEDIAN_DURATION_MINUTES]: `d.median`,
    [EventMetric.PROGRESSIVE_HOURS]: `t.progressive_seconds / 3600.0`,
    [EventMetric.SHORTEST_DURATION_MINUTES]: `d.shortest`,
    [EventMetric.SPANS]: `t.spans`,
    [EventMetric.TOTAL_DURATION_MINUTES]: `t.duration_seconds / 60.0`,
    [EventMetric.UNIQUE_NAMES]: `coalesce(n.names, 0)`,
    [EventMetric.UNIQUE_TAGS]: `coalesce(k.unique_tags, 0)`,
  };

/** The side statement each metric reads, where it reads one. */
export const ROLLUP_METRIC_FAMILIES: ReadonlyMap<EventMetric, RollupFamily> =
  new Map([
    [EventMetric.AVERAGE_DURATION_MINUTES, "durations"],
    [EventMetric.LONGEST_DURATION_MINUTES, "durations"],
    [EventMetric.MEDIAN_DURATION_MINUTES, "durations"],
    [EventMetric.SHORTEST_DURATION_MINUTES, "durations"],
    [EventMetric.UNIQUE_NAMES, "names"],
    [EventMetric.UNIQUE_TAGS, "directs"],
  ]);

/** The side statement of each family, by the alias it joins as. */
export const ROLLUP_FAMILY_ALIASES: Readonly<Record<RollupFamily, string>> = {
  directs: "k",
  durations: "d",
  names: "n",
};

/** The four duration metrics of the groups' spans. */
export const ROLLUP_DURATIONS_SQL = `,
  durations as (
    select w.period{group}, avg(u.seconds / 60.0) as average, max(u.seconds) / 60.0 as longest,
      percentile_cont(0.5) within group (order by u.seconds / 60.0) as median, min(u.seconds) / 60.0 as shortest
    from w cross join lateral unnest(w.span_duration_seconds) as u (seconds)
    group by w.period{group}
  )`;

/** The tags given directly to the groups' events. */
export const ROLLUP_DIRECTS_SQL = `,
  directs as (
    select z.period{zGroup}, count(*) as unique_tags
    from (
      select distinct w.period{group}, k.id
      from w cross join lateral unnest(w.direct_tag_ids) as k (id){tagRoot}
    ) z
    group by z.period{zGroup}
  )`;

/** The distinct event names of the whole set or a calendar group. */
export const ROLLUP_NAMES_SQL = `,
  names as (
    select z.period{zGroup}, count(*) as names
    from (
      select distinct w.period{group}, u.name
      from w cross join lateral unnest(w.event_names) as u (name)
    ) z
    group by z.period{zGroup}
  )`;

/** The distinct names of the events of each tag node. */
export const ROLLUP_TAG_NAMES_SQL = `,
  names as (
    select z.period, z.tag_id, count(*) as names
    from (
      select p.period, r.tag_id, r.name
      from calendar_event_facts r
      join periods p on r.local_day >= p.from_day and r.local_day < p.to_day
      join tags tn on tn.id = r.tag_id and tn.parent_id = {root}::uuid
      where {nameRows}
      union
      select x.period, n.tag_id, x.name
      from x{crossingJoin}
      union
      select c.period, null::uuid, c.name
      from c
    ) z
    group by z.period, z.tag_id
  )`;

/** Limits tags to those beneath `{unique}`. */
export const ROLLUP_TAG_ROOT_SQL = `
      where k.id <> {unique}::uuid and exists (
        select 1
        from tags_closure c
        where c.ancestor_id = {unique}::uuid and c.descendant_id = k.id
      )`;

/** Calendar fields the day rollup groups by, with their keys. */
export const ROLLUP_CALENDAR_KEYS: ReadonlyMap<string, RollupCalendarKey> =
  new Map([
    ["day", { column: "local_day", key: "t.local_day::text" }],
    [
      "month",
      { column: "local_month", key: `substr(t.local_month::text, 1, 7)` },
    ],
    [
      "quarter",
      {
        column: "local_quarter",
        key: `substr(t.local_quarter::text, 1, 4) || '-Q' || extract(quarter from t.local_quarter)::integer::text`,
      },
    ],
    ["year", { column: "local_year", key: "t.local_year::text" }],
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
export const ROLLUP_TAG_CROSSING_SQL = ` cross join lateral unnest(x.tag_ids) as n (tag_id)
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
  columns: "",
  crossingExtra: ", array[x.name] as event_names",
  crossingJoin: "",
  grain: "day",
  group: null,
  join: "",
  names: ROLLUP_NAMES_SQL,
  restrict: "",
  rollupExtra: ", r.event_names",
  root: null,
  untagged: "",
  untaggedRows: "",
};

/** The tag nodes one level beneath a root. */
export const ROLLUP_TAG_TARGET: RollupTarget = {
  columns: ROLLUP_TAG_COLUMNS_SQL,
  crossingExtra: ", n.tag_id",
  crossingJoin: ROLLUP_TAG_CROSSING_SQL,
  grain: "dayTag",
  group: "tag_id",
  join: ROLLUP_TAG_JOIN_SQL,
  names: ROLLUP_TAG_NAMES_SQL,
  restrict: " and r.tag_root_id = {root}::uuid and r.tag_depth = 1",
  rollupExtra: ", r.tag_id",
  root: null,
  untagged: ROLLUP_UNTAGGED_SQL,
  untaggedRows: ROLLUP_UNTAGGED_ROWS_SQL,
};

/** The zone the guard found. */
export const rollupZoneSchema = z.object({ timezone: z.string() });
