// ♟️ Constants

// Every metric per tag node, and for the whole set under a null tag, computed
// from the raw events and the tag tree: the reference the facts must equal.
/** Reference metrics from the raw events. */
export const RAW_METRICS_SQL = `
with phase as (
    select f.id
    from tags as f
    inner join tags as p on f.parent_id = p.id
    inner join tags as a on p.parent_id = a.id and a.parent_id is null
    where a."name" = 'Aspect' and p."name" = 'Phase' and f."name" in ('Forming', 'Dissolving')
),
progressive as (
    select f.id
    from tags as f
    inner join tags as a on f.parent_id = a.id and a.parent_id is null
    where a."name" = 'Temporality' and f."name" = 'Progressive'
),
carried as (
    select et.calendar_event_id, c.ancestor_id as tag_id
    from calendar_event_tags as et
    inner join tags_closure as c on et.tag_id = c.descendant_id
    group by et.calendar_event_id, c.ancestor_id
),
raw as (
    select
        e.id,
        e.summary,
        e."start",
        e."end",
        (e."start" at time zone e.timezone)::date as day,
        extract(epoch from e."end" - e."start") as seconds
    from calendar_events as e
    where (e."start" at time zone e.timezone)::date >= $1::date
        and (e."start" at time zone e.timezone)::date < $2::date
        and not exists (
            select 1 from carried as x
            where x.calendar_event_id = e.id and x.tag_id in (select id from phase)
        )
),
pairs as (
    select r.id, n.tag_id from raw as r inner join carried as n on r.id = n.calendar_event_id
    union all
    select r.id, null from raw as r
)
select
    p.tag_id::text as tag_id,
    (avg(r.seconds / 60) filter (where r."end" > r."start"))::float8 as average,
    (select coalesce(sum(extract(epoch from upper(g) - lower(g))), 0) / 60
        from unnest(range_agg(tstzrange(r."start", r."end"))) as g)::float8 as covered,
    count(distinct r.day)::float8 as days,
    count(*)::float8 as events,
    (extract(epoch from min(r."start")) * 1000)::float8 as first_start,
    (count(*) filter (where r."end" = r."start"))::float8 as instants,
    (extract(epoch from max(r."start")) * 1000)::float8 as last_start,
    (max(r.seconds / 60) filter (where r."end" > r."start"))::float8 as longest,
    (percentile_cont(0.5) within group (order by r.seconds / 60) filter (where r."end" > r."start"))::float8 as median,
    count(distinct r.summary)::float8 as names,
    (coalesce(sum(r.seconds) filter (where exists (
        select 1 from carried as g
        where g.calendar_event_id = r.id and g.tag_id in (select id from progressive)
    )), 0) / 3600)::float8 as progressive_hours,
    (min(r.seconds / 60) filter (where r."end" > r."start"))::float8 as shortest,
    (count(*) filter (where r."end" > r."start"))::float8 as spans,
    (coalesce(sum(r.seconds), 0) / 60)::float8 as total_minutes,
    (select count(distinct d.tag_id) from calendar_event_tags as d
        where d.calendar_event_id = any(array_agg(r.id)))::float8 as unique_tags
from pairs as p
inner join raw as r on p.id = r.id
group by p.tag_id
order by p.tag_id::text collate "C" nulls first`;

// Every metric per tag node, from the day-tag and day-tag-name grains of the
// facts alone, over `[$1, $2)` local days.
/** Per-tag metrics from the facts. */
export const ROLLUP_METRICS_SQL = `
with window_rows as not materialized (
    select * from calendar_event_facts as r
    where r."filter" = 'day-tag' and r.is_phase_boundary = false
        and r.local_day >= $1::date and r.local_day < $2::date
),
totals as (
    select
        w.tag_id,
        sum(w.events) as events,
        sum(w.instants) as instants,
        sum(w.spans) as spans,
        sum(w.duration_seconds) as seconds,
        sum(w.progressive_seconds) as progressive_seconds,
        min(w.first_start) as first_start,
        max(w.last_start) as last_start,
        count(distinct w.local_day) as days,
        range_agg(w.covered_range) as covered
    from window_rows as w
    group by w.tag_id
),
durations as (
    select
        w.tag_id,
        avg(u.seconds / 60.0) as average,
        max(u.seconds) / 60.0 as longest,
        percentile_cont(0.5) within group (order by u.seconds / 60.0) as median,
        min(u.seconds) / 60.0 as shortest
    from window_rows as w
    cross join lateral unnest(w.span_duration_seconds) as u (seconds)
    group by w.tag_id
),
names as (
    select z.tag_id, count(*) as names
    from (
        select distinct m.tag_id, m.name
        from calendar_event_facts as m
        where m."filter" = 'day-tag-name' and m.is_phase_boundary = false
            and m.local_day >= $1::date and m.local_day < $2::date
    ) as z
    group by z.tag_id
),
directs as (
    select z.tag_id, count(*) as unique_tags
    from (
        select distinct w.tag_id, k.id
        from window_rows as w
        cross join lateral unnest(w.direct_tag_ids) as k (id)
    ) as z
    group by z.tag_id
)
select
    t.tag_id::text as tag_id,
    d.average::float8 as average,
    (select coalesce(sum(extract(epoch from upper(g) - lower(g))), 0) / 60 from unnest(t.covered) as g)::float8 as covered,
    t.days::float8 as days,
    t.events::float8 as events,
    (extract(epoch from t.first_start) * 1000)::float8 as first_start,
    t.instants::float8 as instants,
    (extract(epoch from t.last_start) * 1000)::float8 as last_start,
    d.longest::float8 as longest,
    d.median::float8 as median,
    coalesce(n.names, 0)::float8 as names,
    (t.progressive_seconds / 3600.0)::float8 as progressive_hours,
    d.shortest::float8 as shortest,
    t.spans::float8 as spans,
    (t.seconds / 60.0)::float8 as total_minutes,
    coalesce(k.unique_tags, 0)::float8 as unique_tags
from totals as t
left join durations as d on t.tag_id = d.tag_id
left join names as n on t.tag_id = n.tag_id
left join directs as k on t.tag_id = k.tag_id
order by t.tag_id::text collate "C"`;

// Every metric for the whole set under a null tag, from the day grain of the
// facts alone, over `[$1, $2)` local days: no join and no tag.
/** Whole-set metrics from the facts. */
export const ROLLUP_TOTAL_METRICS_SQL = `
with window_rows as not materialized (
    select * from calendar_event_facts as r
    where r."filter" = 'day' and r.is_phase_boundary = false
        and r.local_day >= $1::date and r.local_day < $2::date
),
durations as (
    select
        avg(u.seconds / 60.0) as average,
        max(u.seconds) / 60.0 as longest,
        percentile_cont(0.5) within group (order by u.seconds / 60.0) as median,
        min(u.seconds) / 60.0 as shortest
    from window_rows as w
    cross join lateral unnest(w.span_duration_seconds) as u (seconds)
),
names as (
    select count(distinct u.name) as names
    from window_rows as w cross join lateral unnest(w.event_names) as u (name)
),
directs as (
    select count(distinct k.id) as unique_tags
    from window_rows as w cross join lateral unnest(w.direct_tag_ids) as k (id)
),
totals as (
    select
        sum(w.events) as events,
        sum(w.instants) as instants,
        sum(w.spans) as spans,
        sum(w.duration_seconds) as seconds,
        sum(w.progressive_seconds) as progressive_seconds,
        min(w.first_start) as first_start,
        max(w.last_start) as last_start,
        count(distinct w.local_day) as days,
        range_agg(w.covered_range) as covered
    from window_rows as w
)
select
    null::text as tag_id,
    d.average::float8 as average,
    (select coalesce(sum(extract(epoch from upper(g) - lower(g))), 0) / 60 from unnest(t.covered) as g)::float8 as covered,
    t.days::float8 as days,
    t.events::float8 as events,
    (extract(epoch from t.first_start) * 1000)::float8 as first_start,
    t.instants::float8 as instants,
    (extract(epoch from t.last_start) * 1000)::float8 as last_start,
    d.longest::float8 as longest,
    d.median::float8 as median,
    n.names::float8 as names,
    (t.progressive_seconds / 3600.0)::float8 as progressive_hours,
    d.shortest::float8 as shortest,
    t.spans::float8 as spans,
    (t.seconds / 60.0)::float8 as total_minutes,
    k.unique_tags::float8 as unique_tags
from totals as t
cross join durations as d
cross join names as n
cross join directs as k
where t.events is not null`;
