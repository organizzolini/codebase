import { z } from "zod";

import { TAG_ORDER_KEY_SQL } from "../../../grouping/event-grouping.constants";

// ♟️ Constants

/** Tags an event `e` carries, read from its facts row. */
export const FACTS_TAGS_MATCHING_SQL = `
  select m.tag_id
  from unnest(e.tag_ids) as m (tag_id)
  where m.tag_id = any({tags}::uuid[])
`;

/** The keys of a picked-tags level: the picked tags the event carries. */
export const FACTS_PICKED_KEYS_SQL = `array(
      select u.id::text
      from unnest(e.tag_ids) as u (id)
      where u.id = any({tags}::uuid[])
    )`;

/** The key a calendar level's source computes, if any. */
export const FACTS_CALENDAR_KEYS_SQL = `array_remove(array[(select s."key" from ({source}) s)], null)`;

/** The events in the periods, a row each, with each level's keys. */
export const FACTS_EVENTS_SQL = `
  with periods (period, period_start, period_end) as (
    values {periods}
  ),
  ev as materialized (
    select e.period, e.period_start, e.period_end, e.id, e.summary, e."start", e."end",
      e.start_local_day, e.duration_seconds, e.is_progressive, e.direct_tag_ids{keys}
    from (
      select p.period, p.period_start, p.period_end, f.calendar_event_id as id, f."name" as summary,
        c.description, c.timezone, f."start", f."end", f.local_day::text as start_local_day,
        f.local_hour::integer as start_local_hour, (f.duration_seconds / 60)::integer as duration_minutes,
        case when f.is_instant then 'Instant' else 'Duration' end as temporality,
        f.duration_seconds, f.is_progressive, f.direct_tag_ids, f.tag_ids
      from periods p
      join calendar_event_facts f on f.extent && tstzrange(p.period_start, p.period_end, '[)')
      join calendar_events c on c.id = f.calendar_event_id
    ) e
    {where}
  ){levels}{aggregates}
  select r.*{names}
  from ({union}) r{dimension}
`;

/** One level's rows: each event once for every key it falls under. */
export const FACTS_LEVEL_SQL = `,
  x{level} as (
    select e.*, t.key as t{level}
    from {source} e
    cross join lateral unnest(coalesce(nullif(e.k{level}, '{}'::text[]), array[null::text])) as t (key)
  )`;

/** One level's measures, a group a key path. */
export const FACTS_AGGREGATE_SQL = `,
  a{suffix} as (
    select {level} as level, x.period{keys}, {leaf} as leaf{measures}
    from {source} x
    group by x.period{groupBy}
  )`;

/** One level's distinct values of a measure, counted apart. */
export const FACTS_DISTINCT_SQL = `,
  {name}{suffix} as (
    select z.period{outer}, count(z.value) as {name}
    from (
      select distinct x.period{keys}, {column} as value
      from {source} x
      {join}{where}
    ) z
    group by z.period{outer}
  )`;

/** Limits the tags counted to those beneath `{root}`. */
export const FACTS_TAG_ROOT_SQL = `
    where d.id <> {root}::uuid and exists (
      select 1
      from tags_closure c
      where c.ancestor_id = {root}::uuid and c.descendant_id = d.id
    )`;

/** The names of the tags picked, with their ordering keys. */
export const FACTS_DIMENSION_SQL = `,
  dim as (
    select t.tag_id::text as key, t.tag_name, t.tag_path, ${TAG_ORDER_KEY_SQL}
    from (
      select n.id as tag_id, n.name as tag_name, n.path as tag_path
      from tag_nodes n
      where n.id = any({picked}::uuid[])
    ) t
  )`;

/** One row of the facts statement; keys and measures read apart. */
export const factsRowSchema = z.looseObject({
  label: z.string().nullish().default(null),
  level: z.coerce.number(),
  orderKey: z.string().nullish().default(null),
  path: z.string().nullish().default(null),
  period: z.coerce.number(),
});
