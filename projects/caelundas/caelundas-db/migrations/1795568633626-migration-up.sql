set lock_timeout = '10s';

set statement_timeout = '5min';

create index calendar_event_tag_nodes_direct_tag on calendar_event_tag_nodes (
    tag_id, calendar_event_id
) where is_direct;

create index calendar_event_tag_nodes_root_tag on calendar_event_tag_nodes (tag_root_id, tag_id);

create index calendar_event_tag_nodes_path_event on calendar_event_tag_nodes (tag_path, calendar_event_id);

create index calendar_events_location_start on calendar_events (latitude, longitude, "start");

create index calendar_events_end on calendar_events ("end");

create index tag_nodes_path on tag_nodes ("path");

create index tag_nodes_root_depth on tag_nodes (root_id, "depth");

create materialized view calendar_event_facts as with tag_facts as (
    select
        n.calendar_event_id,
        array_agg(n.tag_id order by n.tag_id) as tag_ids,
        coalesce(array_agg(n.tag_id order by n.tag_id) filter (where n.is_direct), '{}'::uuid[]) as direct_tag_ids,
        count(*) filter (where n.tag_path = 'Temporality / Progressive') > 0 as is_progressive,
        count(*) filter (where n.tag_path in ('Aspect / Phase / Forming', 'Aspect / Phase / Dissolving'))
        > 0 as is_excluded
    from calendar_event_tag_nodes as n
    group by n.calendar_event_id
)

select
    e.id as calendar_event_id,
    e."summary" as "name",
    e."start",
    e."end",
    (e."start" at time zone e.timezone)::date as local_day,
    date_trunc('week', e."start" at time zone e.timezone)::date as local_week,
    date_trunc('month', e."start" at time zone e.timezone)::date as local_month,
    date_trunc('quarter', e."start" at time zone e.timezone)::date as local_quarter,
    extract(year from e."start" at time zone e.timezone)::bigint as local_year,
    extract(dow from e."start" at time zone e.timezone)::bigint as local_weekday,
    extract(hour from e."start" at time zone e.timezone)::bigint as local_hour,
    extract(epoch from e."end" - e."start")::bigint as duration_seconds,
    e."start" = e."end" as is_instant,
    coalesce(t.is_progressive, false) as is_progressive,
    tstzrange(e."start", e."end") as span,
    tstzrange(e."start", e."end", '[]') as extent,
    coalesce(t.tag_ids, '{}'::uuid[]) as tag_ids,
    coalesce(t.direct_tag_ids, '{}'::uuid[]) as direct_tag_ids
from calendar_events as e
left join tag_facts as t on e.id = t.calendar_event_id
where not coalesce(t.is_excluded, false);

insert into caelundas.typeorm_metadata ("database", "schema", "table", "type", "name", "value") values (
    default, $1, default, $2, $3, $4
);

create materialized view calendar_event_day_tag_rollups as with sums as (
    select
        f.local_day,
        f.local_week,
        f.local_month,
        f.local_quarter,
        f.local_year,
        n.tag_id,
        count(*) as events,
        count(*) filter (where n.is_direct) as direct_events,
        count(*) filter (where f.is_instant) as instants,
        count(*) filter (where not f.is_instant) as spans,
        coalesce(sum(f.duration_seconds), 0)::bigint as duration_seconds,
        coalesce(sum(f.duration_seconds) filter (where f.is_progressive), 0)::bigint as progressive_seconds,
        min(f."start") as first_start,
        max(f."start") as last_start,
        range_agg(f.span) as covered_range,
        coalesce(
            array_agg(f.duration_seconds order by f.duration_seconds) filter (where not f.is_instant), '{}'::bigint[]
        ) as span_duration_seconds
    from calendar_event_facts as f
    inner join calendar_event_tag_nodes as n on f.calendar_event_id = n.calendar_event_id
    group by f.local_day, f.local_week, f.local_month, f.local_quarter, f.local_year, n.tag_id
),

directs as (
    select
        f.local_day,
        n.tag_id,
        array_agg(distinct d.id order by d.id) as direct_tag_ids
    from calendar_event_facts as f
    inner join calendar_event_tag_nodes as n on f.calendar_event_id = n.calendar_event_id
    cross join lateral unnest(f.direct_tag_ids) as d (id)
    group by f.local_day, n.tag_id
),

orders as (
    select
        node.id as tag_id,
        string_agg(lpad(a."order"::text, 5, '0') || ':' || a."name", ' / ' order by ancestor_node."depth") as order_key
    from tag_nodes as node
    inner join tags_closure as c on node.id = c.descendant_id
    inner join tags as a on c.ancestor_id = a.id
    inner join tag_nodes as ancestor_node on a.id = ancestor_node.id
    group by node.id
)

select
    s.local_day,
    s.tag_id,
    node."name" as tag_name,
    node."path" as tag_path,
    node."depth" as tag_depth,
    node.root_id as tag_root_id,
    o.order_key as tag_order_key,
    s.local_week,
    s.local_month,
    s.local_quarter,
    s.local_year,
    s.events,
    s.direct_events,
    s.instants,
    s.spans,
    s.duration_seconds,
    s.progressive_seconds,
    s.first_start,
    s.last_start,
    s.covered_range,
    s.span_duration_seconds,
    coalesce(d.direct_tag_ids, '{}'::uuid[]) as direct_tag_ids
from sums as s
inner join tag_nodes as node on s.tag_id = node.id
inner join orders as o on s.tag_id = o.tag_id
left join directs as d on s.local_day = d.local_day and s.tag_id = d.tag_id;

insert into caelundas.typeorm_metadata ("database", "schema", "table", "type", "name", "value") values (
    default, $1, default, $2, $3, $4
);

create materialized view calendar_event_day_tag_name_rollups as select
    f.local_day,
    n.tag_id,
    f."name",
    n.tag_root_id,
    f.local_week,
    f.local_month,
    f.local_quarter,
    f.local_year,
    count(*) as events
from calendar_event_facts as f
inner join calendar_event_tag_nodes as n on f.calendar_event_id = n.calendar_event_id
group by f.local_day, n.tag_id, f."name", n.tag_root_id, f.local_week, f.local_month, f.local_quarter, f.local_year;

insert into caelundas.typeorm_metadata ("database", "schema", "table", "type", "name", "value") values (
    default, $1, default, $2, $3, $4
);

create materialized view calendar_event_day_rollups as with directs as (
    select
        g.local_day,
        array_agg(distinct d.id order by d.id) as direct_tag_ids
    from calendar_event_facts as g
    cross join lateral unnest(g.direct_tag_ids) as d (id)
    group by g.local_day
),

sums as (
    select
        f.local_day,
        f.local_week,
        f.local_month,
        f.local_quarter,
        f.local_year,
        count(*) as events,
        count(*) filter (where f.is_instant) as instants,
        count(*) filter (where not f.is_instant) as spans,
        coalesce(sum(f.duration_seconds), 0)::bigint as duration_seconds,
        coalesce(sum(f.duration_seconds) filter (where f.is_progressive), 0)::bigint as progressive_seconds,
        min(f."start") as first_start,
        max(f."start") as last_start,
        range_agg(f.span) as covered_range,
        coalesce(
            array_agg(f.duration_seconds order by f.duration_seconds) filter (where not f.is_instant), '{}'::bigint[]
        ) as span_duration_seconds,
        array_agg(distinct f."name" order by f."name") as event_names
    from calendar_event_facts as f
    group by f.local_day, f.local_week, f.local_month, f.local_quarter, f.local_year
)

select
    s.local_day,
    s.local_week,
    s.local_month,
    s.local_quarter,
    s.local_year,
    s.events,
    s.instants,
    s.spans,
    s.duration_seconds,
    s.progressive_seconds,
    s.first_start,
    s.last_start,
    s.covered_range,
    s.span_duration_seconds,
    s.event_names,
    coalesce(d.direct_tag_ids, '{}'::uuid[]) as direct_tag_ids
from sums as s
left join directs as d on s.local_day = d.local_day;

insert into caelundas.typeorm_metadata ("database", "schema", "table", "type", "name", "value") values (
    default, $1, default, $2, $3, $4
);

create index calendar_event_facts_direct_tag_ids on calendar_event_facts using gin (direct_tag_ids);

create index calendar_event_facts_tag_ids on calendar_event_facts using gin (tag_ids);

create index calendar_event_facts_extent on calendar_event_facts using gist (extent);

create index calendar_event_facts_name_day on calendar_event_facts ("name", local_day);

create index calendar_event_facts_start on calendar_event_facts ("start");

create index calendar_event_facts_local_weekday on calendar_event_facts (local_weekday, local_day);

create index calendar_event_facts_local_day_hour on calendar_event_facts (local_day, local_hour);

create index calendar_event_facts_local_day on calendar_event_facts (local_day);

create unique index calendar_event_facts_calendar_event_id on calendar_event_facts (calendar_event_id);

create index calendar_event_day_tag_rollups_year_tag on calendar_event_day_tag_rollups (local_year, tag_id);

create index calendar_event_day_tag_rollups_quarter_tag on calendar_event_day_tag_rollups (
    local_quarter, tag_id
);

create index calendar_event_day_tag_rollups_week_tag on calendar_event_day_tag_rollups (local_week, tag_id);

create index calendar_event_day_tag_rollups_month_tag on calendar_event_day_tag_rollups (local_month, tag_id);

create index calendar_event_day_tag_rollups_depth_day on calendar_event_day_tag_rollups (tag_depth, local_day);

create index calendar_event_day_tag_rollups_root_day on calendar_event_day_tag_rollups (tag_root_id, local_day);

create index calendar_event_day_tag_rollups_tag_day on calendar_event_day_tag_rollups (tag_id, local_day);

create unique index calendar_event_day_tag_rollups_day_tag on calendar_event_day_tag_rollups (
    local_day, tag_id
);

create index calendar_event_day_tag_name_rollups_name_day on calendar_event_day_tag_name_rollups (
    "name", local_day
);

create index calendar_event_day_tag_name_rollups_root_day_name on calendar_event_day_tag_name_rollups (
    tag_root_id, local_day, "name"
);

create index calendar_event_day_tag_name_rollups_tag_day_name on calendar_event_day_tag_name_rollups (
    tag_id, local_day, "name"
);

create unique index calendar_event_day_tag_name_rollups_day_tag_name on calendar_event_day_tag_name_rollups (
    local_day, tag_id, "name"
);

create index calendar_event_day_rollups_year on calendar_event_day_rollups (local_year);

create index calendar_event_day_rollups_quarter on calendar_event_day_rollups (local_quarter);

create index calendar_event_day_rollups_week on calendar_event_day_rollups (local_week);

create index calendar_event_day_rollups_month on calendar_event_day_rollups (local_month);

create unique index calendar_event_day_rollups_day on calendar_event_day_rollups (local_day);
