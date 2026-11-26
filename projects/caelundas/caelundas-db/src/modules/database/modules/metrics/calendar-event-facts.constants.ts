// ♟️ Constants

/** The id of the group `slug` names. */
const group = (slug: string): string =>
  `(select id from "groups" where slug = '${slug}')`;

// A cell is a local day and a tag node, or a day alone. The facts are the default
// scope's by definition: every event except the Forming and Dissolving phase
// boundaries, which `phase` finds by tag path. A node counts its descendants.
/** The cells: one local day and tag node, with their measures. */
const CELLS_SQL = `
  phase as (
    select coalesce(array_agg(distinct pc.descendant_id), '{}'::uuid[]) as ids
    from tags as p
    inner join tag_edges as pe on p.id = pe.target_node
    inner join tags as pa on pe.source_node = pa.id
    inner join tag_edges as ae on pa.id = ae.target_node
    inner join tags as ra on ae.source_node = ra.id
    inner join tag_trees as pc on p.id = pc.ancestor_id
    where ra."name" = 'Aspect' and pa."name" = 'Phase' and p."name" in ('Forming', 'Dissolving')
      and not exists (select 1 from tag_edges as above where above.target_node = ra.id)
  ),
  events as (
    select
      e."start",
      e."end",
      e.start_local_day as "day",
      floor(extract(epoch from e."end" - e."start") / 60)::integer as minutes,
      s.tag_ids || s.ancestor_tag_ids as carried
    from calendar_events as e
    inner join calendar_event_tag_sets as s on e.id = s.calendar_event_id
    cross join phase
    where not (s.tag_ids && phase.ids)
  ),
  expanded as (
    select v."day", v."start", v."end", v.minutes, null::uuid as tag_id
    from events as v
    union all
    select v."day", v."start", v."end", v.minutes, k.tag_id
    from events as v
    cross join lateral (select distinct u.id as tag_id from unnest(v.carried) as u (id)) as k
  ),
  cells as (
    select
      x."day",
      x.tag_id,
      count(*) as events,
      count(*) filter (where x."start" = x."end") as perfective,
      count(*) filter (where x."start" < x."end") as progressive,
      sum(x.minutes) as minutes,
      (extract(epoch from min(x."start")) * 1000)::float8 as first_start,
      (extract(epoch from max(x."start")) * 1000)::float8 as last_start
    from expanded as x
    group by x."day", x.tag_id
  )`;

/** Adds the filter of each day with an event. */
const INSERT_DAY_FILTERS_SQL = `
  with ${CELLS_SQL}
  insert into filters (group_id, period)
  select ${group("day")}, d."day"
  from (select distinct "day" from cells where tag_id is null) as d
  on conflict do nothing`;

/** Adds each tag's filters, one per day it has an event. */
const INSERT_TAG_FILTERS_SQL = `
  with ${CELLS_SQL}
  insert into filters (group_id, period, tag_id)
  select ${group("tag")}, c."day", c.tag_id
  from cells as c
  where c.tag_id is not null
  on conflict do nothing`;

/** Hangs each tag filter beneath its day's, not another tag's. */
const PLACE_TAG_FILTERS_SQL = `
  update filters as f
  set parent_id = df.id, updated_at = now()
  from filters as df
  where f.group_id = ${group("tag")}
    and df.group_id = ${group("day")}
    and df.period = f.period
    and f.parent_id is distinct from df.id`;

/** Drops the filters of days and tags that lost their events. */
const DELETE_FILTERS_SQL = `
  with ${CELLS_SQL}
  delete from filters as f
  where f.group_id in (${group("day")}, ${group("tag")})
    and not exists (
      select 1
      from cells as c
      where c."day" = f.period and c.tag_id is not distinct from f.tag_id
    )`;

// A zero reads as no row, and the measures that do not merge have none.
/** Every cell's measures, as the rows the facts should hold. */
const WANTED_SQL = `
  located as (
    select c.*, f.id as filter_id
    from cells as c
    inner join filters as f
      on f.period = c."day" and f.tag_id is not distinct from c.tag_id
      and f.group_id = case when c.tag_id is null then ${group("day")} else ${group("tag")} end
  ),
  wanted as (
    select l.filter_id, m.id as measure_id, v.measurement
    from located as l
    cross join lateral (values
      ('events', l.events::float8),
      ('perfective-events', case when l.perfective > 0 then l.perfective::float8 end),
      ('progressive-events', case when l.progressive > 0 then l.progressive::float8 end),
      ('duration', case when l.minutes > 0 then l.minutes::float8 end),
      ('first-start', l.first_start),
      ('last-start', l.last_start)
    ) as v (slug, measurement)
    inner join measures as m on m.slug = v.slug
    where v.measurement is not null
  )`;

/** Writes the new or changed measures, touching no other row. */
const UPSERT_FACTS_SQL = `
  with ${CELLS_SQL},
  ${WANTED_SQL}
  insert into calendar_event_facts (filter_id, measure_id, measurement)
  select w.filter_id, w.measure_id, w.measurement
  from wanted as w
  on conflict (filter_id, measure_id)
  do update set measurement = excluded.measurement
  where calendar_event_facts.measurement is distinct from excluded.measurement`;

/** Drops the measures that no cell holds any more. */
const DELETE_FACTS_SQL = `
  with ${CELLS_SQL},
  ${WANTED_SQL}
  delete from calendar_event_facts as r
  where not exists (
    select 1
    from wanted as w
    where w.filter_id = r.filter_id and w.measure_id = r.measure_id
  )`;

/** The refresh statements, in the order they must run. */
export const METRICS_REFRESH_STATEMENTS: readonly string[] = [
  "refresh materialized view concurrently tag_trees",
  "refresh materialized view concurrently calendar_event_tag_sets",
  INSERT_DAY_FILTERS_SQL,
  INSERT_TAG_FILTERS_SQL,
  PLACE_TAG_FILTERS_SQL,
  DELETE_FILTERS_SQL,
  UPSERT_FACTS_SQL,
  DELETE_FACTS_SQL,
];
