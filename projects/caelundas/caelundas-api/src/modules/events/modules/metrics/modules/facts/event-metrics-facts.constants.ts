import { z } from "zod";

import {
  PROGRESSIVE_TAG_IDS_SQL,
  TAG_INFO_SQL,
} from "../../../filtering/modules/query-building/event-filter-sql.constants";

// ♟️ Constants

/** Tags in `{tags}` an event `e` carries, ancestors included. */
export const FACTS_TAGS_MATCHING_SQL = `
  select m.tag_id
  from unnest(e.tag_ids || e.ancestor_tag_ids) as m (tag_id)
  where m.tag_id = any({tags}::uuid[])
`;

/** The keys of a picked-tags level: the picked tags the event carries. */
export const FACTS_PICKED_KEYS_SQL = `array(
      select distinct u.id::text
      from unnest(e.tag_ids || e.ancestor_tag_ids) as u (id)
      where u.id = any({tags}::uuid[])
    )`;

// What an event row holds is only what the tables cannot give; the rest of the
// columns a measure reads are computed from it, as the day grains would sum it.
/** The measure columns of an event row, from the facts row `f`. */
export const FACTS_EVENT_COLUMN_SQL: Readonly<Record<string, string>> = {
  covered_range: `tstzmultirange(tstzrange(f."start", f."end"))`,
  events: `1`,
  first_start: `f."start"`,
  is_progressive: `f.tag_ids && ${PROGRESSIVE_TAG_IDS_SQL}`,
  last_start: `f."start"`,
  perfective_events: `(f."start" = f."end")::int`,
  progressive_events: `(f."start" < f."end")::int`,
};

/** The key a calendar level's source computes, if any. */
export const FACTS_CALENDAR_KEYS_SQL = `array_remove(array[(select s."key" from ({source}) s)], null)`;

/** The events with their tags from the tag sets. */
export const FACTS_EVENT_SOURCE_SQL = `(
    select c.id as calendar_event_id, c."name", c.note, c.timezone, c."start", c."end",
      c.start_local_day as "day", c.end_local_day, c.start_local_hour as "hour",
      floor(extract(epoch from c."end" - c."start") / 60)::integer as duration_minutes,
      s.tag_ids, s.ancestor_tag_ids
    from calendar_events c
    join calendar_event_tag_sets s on s.calendar_event_id = c.id
  )`;

// Each event of the periods once, with the columns the filter, the levels and
// the measures read. `window_events` declares the rows it returns, as
// `expand_keys` does, so the planner does not multiply its own error level by level.
/** The events of the periods, a row each. */
export const FACTS_EVENT_ROWS_SQL = `
      select p.period, p.period_start, p.period_end, f.calendar_event_id as id, f."name",
        f.note, f.timezone, f."start", f."end", f."day"::text as start_local_day,
        f.end_local_day::text as end_local_day, f."hour"::integer as start_local_hour,
        f.duration_minutes, case when f."start" = f."end" then 'Instant' else 'Duration' end as temporality,
        f.tag_ids, f.ancestor_tag_ids{extra}
      from periods p
      join lateral window_events(p.period_start, p.period_end) f on {eventRows}`;

/** The events in the periods, a row each, with each level's keys. */
export const FACTS_EVENTS_SQL = `
  with ${TAG_INFO_SQL},
  periods (period, period_start, period_end) as (
    values {periods}
  ),
  ev as materialized (
    select e.period, e.period_start, e.period_end, e.id, e."name", e."start", e."end",
      e.start_local_day, e.duration_minutes, e.tag_ids{eventColumns}{keys}
    from (${FACTS_EVENT_ROWS_SQL}
    ) e
    {where}
  ){levels}{aggregates}
  select r.level, r.period{keyColumns}{names}{metrics}
  from ({union}) r{dimension}
`;

/** One level's rows: each event once for every key it falls under. */
export const FACTS_LEVEL_SQL = `,
  x{level} as (
    select e.*, t.key as t{level}
    from {source} e
    cross join lateral expand_keys(e.k{level}) as t (key)
  )`;

// `gk` is the period and key path as one text, so a join on `gk` is a plain
// equality Postgres can hash, whatever it thinks the row counts are.
/** One level's measures, a group a key path. */
export const FACTS_AGGREGATE_SQL = `,
  a{suffix} as (
    select {level} as level, x.period{keys}, {leaf} as leaf, {gk} as gk{measures}
    from {source} x
    group by x.period{groupBy}
  )`;

/** One level's distinct values of a measure, counted apart. */
export const FACTS_DISTINCT_SQL = `,
  {name} as (
    select z.period{outer}, {zgk} as gk, count(z.value) as v
    from (
      select distinct x.period{keys}, {column} as value
      from {source} x
      {join}{where}
    ) z
    group by z.period{outer}
  )`;

/** What the measures counted apart read: each event's directly given tags. */
export const FACTS_SIDE_SQL = {
  column: "d.id",
  join: "cross join lateral expand_tags(x.tag_ids) as d (id)",
} as const;

/** Limits the tags counted to those beneath `{root}`. */
export const FACTS_TAG_ROOT_SQL = `
    where d.id <> {root}::uuid and exists (
      select 1
      from tag_closures c
      where c.ancestor_id = {root}::uuid and c.descendant_id = d.id
    )`;

/** The names of the tags picked, with their ranks. */
export const FACTS_DIMENSION_SQL = `,
  dim as (
    select t.tag_id::text as key, t.tag_name, t.tag_path, t.tag_rank as "rank"
    from tag_info t
    where t.tag_id = any({picked}::uuid[])
  )`;

/** One row of the facts statement; keys and measures read apart. */
export const factsRowSchema = z.looseObject({
  label: z.string().nullish().default(null),
  level: z.coerce.number(),
  path: z.string().nullish().default(null),
  period: z.coerce.number(),
  rank: z.string().nullish().default(null),
});
