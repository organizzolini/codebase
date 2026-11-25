import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds the metrics pre-aggregation layer: the materialized views
 * `calendar_event_facts`, `calendar_event_day_tag_rollups`,
 * `calendar_event_day_tag_name_rollups` and `calendar_event_day_rollups`, each
 * with the unique index that lets `refreshMetrics` refresh it concurrently,
 * and the indexes the read model's tables lacked.
 */
export class Migration1795568633626 implements MigrationInterface {
  name = "Migration1795568633626";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(
      `CREATE INDEX "calendar_event_tag_nodes_direct_tag" ON "calendar_event_tag_nodes"  ("tag_id", "calendar_event_id") WHERE "is_direct"`,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_tag_nodes_root_tag" ON "calendar_event_tag_nodes"  ("tag_root_id", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_tag_nodes_path_event" ON "calendar_event_tag_nodes"  ("tag_path", "calendar_event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_events_location_start" ON "calendar_events"  ("latitude", "longitude", "start") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_events_end" ON "calendar_events"  ("end") `,
    );
    await queryRunner.query(
      `CREATE INDEX "tag_nodes_path" ON "tag_nodes"  ("path") `,
    );
    await queryRunner.query(
      `CREATE INDEX "tag_nodes_root_depth" ON "tag_nodes"  ("root_id", "depth") `,
    );
    await queryRunner.query(`CREATE MATERIALIZED VIEW "calendar_event_facts" AS with tag_facts as (
    select
        n.calendar_event_id,
        array_agg(n.tag_id order by n.tag_id) as tag_ids,
        coalesce(array_agg(n.tag_id order by n.tag_id) filter (where n.is_direct), '{}'::uuid[]) as direct_tag_ids,
        count(*) filter (where n.tag_path = 'Temporality / Progressive') > 0 as is_progressive,
        count(*) filter (where n.tag_path in ('Aspect / Phase / Forming', 'Aspect / Phase / Dissolving')) > 0 as is_excluded
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
where not coalesce(t.is_excluded, false)`);
    await queryRunner.query(
      `INSERT INTO "caelundas"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        "caelundas",
        "MATERIALIZED_VIEW",
        "calendar_event_facts",
        'with tag_facts as (\n    select\n        n.calendar_event_id,\n        array_agg(n.tag_id order by n.tag_id) as tag_ids,\n        coalesce(array_agg(n.tag_id order by n.tag_id) filter (where n.is_direct), \'{}\'::uuid[]) as direct_tag_ids,\n        count(*) filter (where n.tag_path = \'Temporality / Progressive\') > 0 as is_progressive,\n        count(*) filter (where n.tag_path in (\'Aspect / Phase / Forming\', \'Aspect / Phase / Dissolving\')) > 0 as is_excluded\n    from calendar_event_tag_nodes as n\n    group by n.calendar_event_id\n)\nselect\n    e.id as calendar_event_id,\n    e."summary" as "name",\n    e."start",\n    e."end",\n    (e."start" at time zone e.timezone)::date as local_day,\n    date_trunc(\'week\', e."start" at time zone e.timezone)::date as local_week,\n    date_trunc(\'month\', e."start" at time zone e.timezone)::date as local_month,\n    date_trunc(\'quarter\', e."start" at time zone e.timezone)::date as local_quarter,\n    extract(year from e."start" at time zone e.timezone)::bigint as local_year,\n    extract(dow from e."start" at time zone e.timezone)::bigint as local_weekday,\n    extract(hour from e."start" at time zone e.timezone)::bigint as local_hour,\n    extract(epoch from e."end" - e."start")::bigint as duration_seconds,\n    e."start" = e."end" as is_instant,\n    coalesce(t.is_progressive, false) as is_progressive,\n    tstzrange(e."start", e."end") as span,\n    tstzrange(e."start", e."end", \'[]\') as extent,\n    coalesce(t.tag_ids, \'{}\'::uuid[]) as tag_ids,\n    coalesce(t.direct_tag_ids, \'{}\'::uuid[]) as direct_tag_ids\nfrom calendar_events as e\nleft join tag_facts as t on e.id = t.calendar_event_id\nwhere not coalesce(t.is_excluded, false)',
      ],
    );
    await queryRunner.query(`CREATE MATERIALIZED VIEW "calendar_event_day_tag_rollups" AS with sums as (
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
        coalesce(array_agg(f.duration_seconds order by f.duration_seconds) filter (where not f.is_instant), '{}'::bigint[]) as span_duration_seconds
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
left join directs as d on s.local_day = d.local_day and s.tag_id = d.tag_id`);
    await queryRunner.query(
      `INSERT INTO "caelundas"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        "caelundas",
        "MATERIALIZED_VIEW",
        "calendar_event_day_tag_rollups",
        'with sums as (\n    select\n        f.local_day,\n        f.local_week,\n        f.local_month,\n        f.local_quarter,\n        f.local_year,\n        n.tag_id,\n        count(*) as events,\n        count(*) filter (where n.is_direct) as direct_events,\n        count(*) filter (where f.is_instant) as instants,\n        count(*) filter (where not f.is_instant) as spans,\n        coalesce(sum(f.duration_seconds), 0)::bigint as duration_seconds,\n        coalesce(sum(f.duration_seconds) filter (where f.is_progressive), 0)::bigint as progressive_seconds,\n        min(f."start") as first_start,\n        max(f."start") as last_start,\n        range_agg(f.span) as covered_range,\n        coalesce(array_agg(f.duration_seconds order by f.duration_seconds) filter (where not f.is_instant), \'{}\'::bigint[]) as span_duration_seconds\n    from calendar_event_facts as f\n    inner join calendar_event_tag_nodes as n on f.calendar_event_id = n.calendar_event_id\n    group by f.local_day, f.local_week, f.local_month, f.local_quarter, f.local_year, n.tag_id\n),\ndirects as (\n    select\n        f.local_day,\n        n.tag_id,\n        array_agg(distinct d.id order by d.id) as direct_tag_ids\n    from calendar_event_facts as f\n    inner join calendar_event_tag_nodes as n on f.calendar_event_id = n.calendar_event_id\n    cross join lateral unnest(f.direct_tag_ids) as d (id)\n    group by f.local_day, n.tag_id\n),\norders as (\n    select\n        node.id as tag_id,\n        string_agg(lpad(a."order"::text, 5, \'0\') || \':\' || a."name", \' / \' order by ancestor_node."depth") as order_key\n    from tag_nodes as node\n    inner join tags_closure as c on node.id = c.descendant_id\n    inner join tags as a on c.ancestor_id = a.id\n    inner join tag_nodes as ancestor_node on a.id = ancestor_node.id\n    group by node.id\n)\nselect\n    s.local_day,\n    s.tag_id,\n    node."name" as tag_name,\n    node."path" as tag_path,\n    node."depth" as tag_depth,\n    node.root_id as tag_root_id,\n    o.order_key as tag_order_key,\n    s.local_week,\n    s.local_month,\n    s.local_quarter,\n    s.local_year,\n    s.events,\n    s.direct_events,\n    s.instants,\n    s.spans,\n    s.duration_seconds,\n    s.progressive_seconds,\n    s.first_start,\n    s.last_start,\n    s.covered_range,\n    s.span_duration_seconds,\n    coalesce(d.direct_tag_ids, \'{}\'::uuid[]) as direct_tag_ids\nfrom sums as s\ninner join tag_nodes as node on s.tag_id = node.id\ninner join orders as o on s.tag_id = o.tag_id\nleft join directs as d on s.local_day = d.local_day and s.tag_id = d.tag_id',
      ],
    );
    await queryRunner.query(`CREATE MATERIALIZED VIEW "calendar_event_day_tag_name_rollups" AS select
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
group by f.local_day, n.tag_id, f."name", n.tag_root_id, f.local_week, f.local_month, f.local_quarter, f.local_year`);
    await queryRunner.query(
      `INSERT INTO "caelundas"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        "caelundas",
        "MATERIALIZED_VIEW",
        "calendar_event_day_tag_name_rollups",
        'select\n    f.local_day,\n    n.tag_id,\n    f."name",\n    n.tag_root_id,\n    f.local_week,\n    f.local_month,\n    f.local_quarter,\n    f.local_year,\n    count(*) as events\nfrom calendar_event_facts as f\ninner join calendar_event_tag_nodes as n on f.calendar_event_id = n.calendar_event_id\ngroup by f.local_day, n.tag_id, f."name", n.tag_root_id, f.local_week, f.local_month, f.local_quarter, f.local_year',
      ],
    );
    await queryRunner.query(`CREATE MATERIALIZED VIEW "calendar_event_day_rollups" AS with directs as (
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
        coalesce(array_agg(f.duration_seconds order by f.duration_seconds) filter (where not f.is_instant), '{}'::bigint[]) as span_duration_seconds,
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
left join directs as d on s.local_day = d.local_day`);
    await queryRunner.query(
      `INSERT INTO "caelundas"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        "caelundas",
        "MATERIALIZED_VIEW",
        "calendar_event_day_rollups",
        'with directs as (\n    select\n        g.local_day,\n        array_agg(distinct d.id order by d.id) as direct_tag_ids\n    from calendar_event_facts as g\n    cross join lateral unnest(g.direct_tag_ids) as d (id)\n    group by g.local_day\n),\nsums as (\n    select\n        f.local_day,\n        f.local_week,\n        f.local_month,\n        f.local_quarter,\n        f.local_year,\n        count(*) as events,\n        count(*) filter (where f.is_instant) as instants,\n        count(*) filter (where not f.is_instant) as spans,\n        coalesce(sum(f.duration_seconds), 0)::bigint as duration_seconds,\n        coalesce(sum(f.duration_seconds) filter (where f.is_progressive), 0)::bigint as progressive_seconds,\n        min(f."start") as first_start,\n        max(f."start") as last_start,\n        range_agg(f.span) as covered_range,\n        coalesce(array_agg(f.duration_seconds order by f.duration_seconds) filter (where not f.is_instant), \'{}\'::bigint[]) as span_duration_seconds,\n        array_agg(distinct f."name" order by f."name") as event_names\n    from calendar_event_facts as f\n    group by f.local_day, f.local_week, f.local_month, f.local_quarter, f.local_year\n)\nselect\n    s.local_day,\n    s.local_week,\n    s.local_month,\n    s.local_quarter,\n    s.local_year,\n    s.events,\n    s.instants,\n    s.spans,\n    s.duration_seconds,\n    s.progressive_seconds,\n    s.first_start,\n    s.last_start,\n    s.covered_range,\n    s.span_duration_seconds,\n    s.event_names,\n    coalesce(d.direct_tag_ids, \'{}\'::uuid[]) as direct_tag_ids\nfrom sums as s\nleft join directs as d on s.local_day = d.local_day',
      ],
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_direct_tag_ids" ON "calendar_event_facts" USING gin ("direct_tag_ids") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_tag_ids" ON "calendar_event_facts" USING gin ("tag_ids") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_extent" ON "calendar_event_facts" USING gist ("extent") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_name_day" ON "calendar_event_facts"  ("name", "local_day") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_start" ON "calendar_event_facts"  ("start") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_local_weekday" ON "calendar_event_facts"  ("local_weekday", "local_day") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_local_day_hour" ON "calendar_event_facts"  ("local_day", "local_hour") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_local_day" ON "calendar_event_facts"  ("local_day") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "calendar_event_facts_calendar_event_id" ON "calendar_event_facts"  ("calendar_event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_tag_rollups_year_tag" ON "calendar_event_day_tag_rollups"  ("local_year", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_tag_rollups_quarter_tag" ON "calendar_event_day_tag_rollups"  ("local_quarter", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_tag_rollups_week_tag" ON "calendar_event_day_tag_rollups"  ("local_week", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_tag_rollups_month_tag" ON "calendar_event_day_tag_rollups"  ("local_month", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_tag_rollups_depth_day" ON "calendar_event_day_tag_rollups"  ("tag_depth", "local_day") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_tag_rollups_root_day" ON "calendar_event_day_tag_rollups"  ("tag_root_id", "local_day") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_tag_rollups_tag_day" ON "calendar_event_day_tag_rollups"  ("tag_id", "local_day") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "calendar_event_day_tag_rollups_day_tag" ON "calendar_event_day_tag_rollups"  ("local_day", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_tag_name_rollups_name_day" ON "calendar_event_day_tag_name_rollups"  ("name", "local_day") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_tag_name_rollups_root_day_name" ON "calendar_event_day_tag_name_rollups"  ("tag_root_id", "local_day", "name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_tag_name_rollups_tag_day_name" ON "calendar_event_day_tag_name_rollups"  ("tag_id", "local_day", "name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "calendar_event_day_tag_name_rollups_day_tag_name" ON "calendar_event_day_tag_name_rollups"  ("local_day", "tag_id", "name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_rollups_year" ON "calendar_event_day_rollups"  ("local_year") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_rollups_quarter" ON "calendar_event_day_rollups"  ("local_quarter") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_rollups_week" ON "calendar_event_day_rollups"  ("local_week") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_day_rollups_month" ON "calendar_event_day_rollups"  ("local_month") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "calendar_event_day_rollups_day" ON "calendar_event_day_rollups"  ("local_day") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_calendar_event_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_local_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_local_day_hour"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_local_weekday"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_start"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_name_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_extent"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_tag_ids"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_direct_tag_ids"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_rollups_day_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_rollups_tag_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_rollups_root_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_rollups_depth_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_rollups_month_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_rollups_week_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_rollups_quarter_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_rollups_year_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_name_rollups_day_tag_name"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_name_rollups_tag_day_name"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_name_rollups_root_day_name"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_tag_name_rollups_name_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_rollups_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_rollups_month"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_rollups_week"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_rollups_quarter"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_day_rollups_year"`,
    );
    await queryRunner.query(
      `DELETE FROM "caelundas"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ["MATERIALIZED_VIEW", "calendar_event_day_rollups", "caelundas"],
    );
    await queryRunner.query(
      `DROP MATERIALIZED VIEW "calendar_event_day_rollups"`,
    );
    await queryRunner.query(
      `DELETE FROM "caelundas"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ["MATERIALIZED_VIEW", "calendar_event_day_tag_name_rollups", "caelundas"],
    );
    await queryRunner.query(
      `DROP MATERIALIZED VIEW "calendar_event_day_tag_name_rollups"`,
    );
    await queryRunner.query(
      `DELETE FROM "caelundas"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ["MATERIALIZED_VIEW", "calendar_event_day_tag_rollups", "caelundas"],
    );
    await queryRunner.query(
      `DROP MATERIALIZED VIEW "calendar_event_day_tag_rollups"`,
    );
    await queryRunner.query(
      `DELETE FROM "caelundas"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ["MATERIALIZED_VIEW", "calendar_event_facts", "caelundas"],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW "calendar_event_facts"`);
    await queryRunner.query(`DROP INDEX "caelundas"."tag_nodes_root_depth"`);
    await queryRunner.query(`DROP INDEX "caelundas"."tag_nodes_path"`);
    await queryRunner.query(`DROP INDEX "caelundas"."calendar_events_end"`);
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_events_location_start"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_tag_nodes_path_event"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_tag_nodes_root_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_tag_nodes_direct_tag"`,
    );
  }
}
