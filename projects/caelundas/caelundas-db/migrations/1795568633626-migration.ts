import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds the metrics pre-aggregation layer: the one materialized view
 * `calendar_event_facts`, whose `filter` column names each row's grain, with
 * the unique `row_key` index that lets `refreshMetrics` refresh it
 * concurrently, filter-led indexes, and the base table indexes.
 */
export class Migration1795568633626 implements MigrationInterface {
  name = "Migration1795568633626";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(
      `CREATE INDEX "calendar_events_location_start" ON "calendar_events"  ("latitude", "longitude", "start") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_events_end" ON "calendar_events"  ("end") `,
    );
    await queryRunner.query(`CREATE MATERIALIZED VIEW "calendar_event_facts" AS with levels as (
    select
        descendant_id as id,
        count(*) as generation
    from tags_closure
    group by descendant_id
),

nodes as (
    select
        t.id,
        t."name",
        own.generation - 1 as tag_depth,
        (array_agg(a.id order by ancestor_level.generation))[1] as tag_root_id,
        string_agg(a."name", ' / ' order by ancestor_level.generation) as tag_path,
        string_agg(lpad(a.rank::text, 5, '0') || ':' || a."name", ' / ' order by ancestor_level.generation) as tag_rank
    from tags as t
    inner join levels as own on t.id = own.id
    inner join tags_closure as c on t.id = c.descendant_id
    inner join tags as a on c.ancestor_id = a.id
    inner join levels as ancestor_level on a.id = ancestor_level.id
    group by t.id, t."name", own.generation
),

carried as (
    select
        et.calendar_event_id,
        c.ancestor_id as tag_id
    from calendar_event_tags as et
    inner join tags_closure as c on et.tag_id = c.descendant_id
    group by et.calendar_event_id, c.ancestor_id
),

marks as (
    select
        k.calendar_event_id,
        array_agg(k.tag_id order by k.tag_id) as tag_ids,
        count(*) filter (where n.tag_path = 'Temporality / Progressive') > 0 as is_progressive,
        count(*) filter (where n.tag_path in ('Aspect / Phase / Forming', 'Aspect / Phase / Dissolving')) > 0 as is_phase_boundary
    from carried as k
    inner join nodes as n on k.tag_id = n.id
    group by k.calendar_event_id
),

given as (
    select
        calendar_event_id,
        array_agg(tag_id order by tag_id) as direct_tag_ids
    from calendar_event_tags
    group by calendar_event_id
),

events as (
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
        coalesce(m.is_progressive, false) as is_progressive,
        coalesce(m.is_phase_boundary, false) as is_phase_boundary,
        tstzrange(e."start", e."end") as span,
        tstzrange(e."start", e."end", '[]') as extent,
        coalesce(m.tag_ids, '{}'::uuid[]) as tag_ids,
        coalesce(g.direct_tag_ids, '{}'::uuid[]) as direct_tag_ids
    from calendar_events as e
    left join marks as m on e.id = m.calendar_event_id
    left join given as g on e.id = g.calendar_event_id
),

expanded as (
    select
        v.*,
        null::uuid as tag_id
    from events as v
    union all
    select
        v.*,
        k.tag_id
    from events as v
    inner join carried as k on v.calendar_event_id = k.calendar_event_id
),

sums as (
    select
        case
            when grouping(x.calendar_event_id) = 0 then 'event'
            when grouping(x."name") = 0 then 'day-tag-name'
            when x.tag_id is null then 'day'
            else 'day-tag'
        end as "filter",
        x.calendar_event_id,
        x.local_day,
        x.is_phase_boundary,
        x.tag_id,
        x."name",
        count(*) as events,
        count(*) filter (where x.is_instant) as instants,
        count(*) filter (where not x.is_instant) as spans,
        coalesce(sum(x.duration_seconds), 0)::bigint as duration_seconds,
        coalesce(sum(x.duration_seconds) filter (where x.is_progressive), 0)::bigint as progressive_seconds,
        min(x."start") as first_start,
        max(x."start") as last_start,
        range_agg(x.span) as covered_range,
        coalesce(
            array_agg(x.duration_seconds order by x.duration_seconds) filter (where not x.is_instant), '{}'::bigint[]
        ) as span_duration_seconds,
        array_agg(distinct x."name" order by x."name") filter (where x.tag_id is null) as event_names
    from expanded as x
    group by grouping sets (
        (x.calendar_event_id),
        (x.local_day, x.is_phase_boundary, x.tag_id),
        (x.local_day, x.is_phase_boundary, x.tag_id, x."name")
    )
),

directs as (
    select
        x.local_day,
        x.is_phase_boundary,
        x.tag_id,
        array_agg(distinct d.id order by d.id) as direct_tag_ids
    from expanded as x
    cross join lateral unnest(x.direct_tag_ids) as d (id)
    group by x.local_day, x.is_phase_boundary, x.tag_id
),

facts as (
select
    s."filter",
    s.calendar_event_id,
    case when s."filter" in ('event', 'day-tag-name') then coalesce(v."name", s."name") end as "name",
    v."start",
    v."end",
    coalesce(v.local_day, s.local_day) as local_day,
    date_trunc('week', coalesce(v.local_day, s.local_day)::timestamp)::date as local_week,
    date_trunc('month', coalesce(v.local_day, s.local_day)::timestamp)::date as local_month,
    date_trunc('quarter', coalesce(v.local_day, s.local_day)::timestamp)::date as local_quarter,
    extract(year from coalesce(v.local_day, s.local_day))::bigint as local_year,
    v.local_weekday,
    v.local_hour,
    v.is_instant,
    v.is_progressive,
    coalesce(v.is_phase_boundary, s.is_phase_boundary) as is_phase_boundary,
    v.extent,
    v.tag_ids,
    case when s."filter" = 'event' then v.direct_tag_ids else u.direct_tag_ids end as direct_tag_ids,
    s.tag_id,
    case when s."filter" = 'day-tag' then n."name" end as tag_name,
    case when s."filter" = 'day-tag' then n.tag_path end as tag_path,
    case when s."filter" = 'day-tag' then n.tag_depth end as tag_depth,
    n.tag_root_id as tag_root_id,
    case when s."filter" = 'day-tag' then n.tag_rank end as tag_rank,
    case when s."filter" = 'event' then 1 else s.events end as events,
    case when s."filter" = 'event' then v.is_instant::int when s."filter" <> 'day-tag-name' then s.instants end as instants,
    case when s."filter" = 'event' then (not v.is_instant)::int when s."filter" <> 'day-tag-name' then s.spans end as spans,
    case when s."filter" = 'event' then v.duration_seconds when s."filter" <> 'day-tag-name' then s.duration_seconds end as duration_seconds,
    case
        when s."filter" = 'event' then (case when v.is_progressive then v.duration_seconds else 0 end)
        when s."filter" <> 'day-tag-name' then s.progressive_seconds
    end as progressive_seconds,
    case when s."filter" = 'event' then v."start" when s."filter" <> 'day-tag-name' then s.first_start end as first_start,
    case when s."filter" = 'event' then v."start" when s."filter" <> 'day-tag-name' then s.last_start end as last_start,
    case when s."filter" = 'event' then tstzmultirange(v.span) when s."filter" <> 'day-tag-name' then s.covered_range end as covered_range,
    case
        when s."filter" = 'event' then (case when v.is_instant then '{}'::bigint[] else array[v.duration_seconds] end)
        when s."filter" <> 'day-tag-name' then s.span_duration_seconds
    end as span_duration_seconds,
    case when s."filter" = 'day' then s.event_names end as event_names
from sums as s
left join events as v on s.calendar_event_id = v.calendar_event_id
left join nodes as n on s.tag_id = n.id
left join directs as u
    on
        s."filter" in ('day', 'day-tag')
        and s.local_day = u.local_day
        and s.is_phase_boundary = u.is_phase_boundary
        and coalesce(s.tag_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(u.tag_id, '00000000-0000-0000-0000-000000000000'::uuid)
where not (s."filter" = 'day-tag-name' and s.tag_id is null)
)

select
    f.*,
    md5(
        f."filter" || '|' || coalesce(f.calendar_event_id::text, '') || '|' || coalesce(f.local_day::text, '') || '|'
        || f.is_phase_boundary::text || '|' || coalesce(f.tag_id::text, '') || '|' || coalesce(f."name", '')
    )::uuid as row_key
from facts as f`);
    await queryRunner.query(
      `INSERT INTO "caelundas"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        "caelundas",
        "MATERIALIZED_VIEW",
        "calendar_event_facts",
        'with levels as (\n    select\n        descendant_id as id,\n        count(*) as generation\n    from tags_closure\n    group by descendant_id\n),\n\nnodes as (\n    select\n        t.id,\n        t."name",\n        own.generation - 1 as tag_depth,\n        (array_agg(a.id order by ancestor_level.generation))[1] as tag_root_id,\n        string_agg(a."name", \' / \' order by ancestor_level.generation) as tag_path,\n        string_agg(lpad(a.rank::text, 5, \'0\') || \':\' || a."name", \' / \' order by ancestor_level.generation) as tag_rank\n    from tags as t\n    inner join levels as own on t.id = own.id\n    inner join tags_closure as c on t.id = c.descendant_id\n    inner join tags as a on c.ancestor_id = a.id\n    inner join levels as ancestor_level on a.id = ancestor_level.id\n    group by t.id, t."name", own.generation\n),\n\ncarried as (\n    select\n        et.calendar_event_id,\n        c.ancestor_id as tag_id\n    from calendar_event_tags as et\n    inner join tags_closure as c on et.tag_id = c.descendant_id\n    group by et.calendar_event_id, c.ancestor_id\n),\n\nmarks as (\n    select\n        k.calendar_event_id,\n        array_agg(k.tag_id order by k.tag_id) as tag_ids,\n        count(*) filter (where n.tag_path = \'Temporality / Progressive\') > 0 as is_progressive,\n        count(*) filter (where n.tag_path in (\'Aspect / Phase / Forming\', \'Aspect / Phase / Dissolving\')) > 0 as is_phase_boundary\n    from carried as k\n    inner join nodes as n on k.tag_id = n.id\n    group by k.calendar_event_id\n),\n\ngiven as (\n    select\n        calendar_event_id,\n        array_agg(tag_id order by tag_id) as direct_tag_ids\n    from calendar_event_tags\n    group by calendar_event_id\n),\n\nevents as (\n    select\n        e.id as calendar_event_id,\n        e."summary" as "name",\n        e."start",\n        e."end",\n        (e."start" at time zone e.timezone)::date as local_day,\n        date_trunc(\'week\', e."start" at time zone e.timezone)::date as local_week,\n        date_trunc(\'month\', e."start" at time zone e.timezone)::date as local_month,\n        date_trunc(\'quarter\', e."start" at time zone e.timezone)::date as local_quarter,\n        extract(year from e."start" at time zone e.timezone)::bigint as local_year,\n        extract(dow from e."start" at time zone e.timezone)::bigint as local_weekday,\n        extract(hour from e."start" at time zone e.timezone)::bigint as local_hour,\n        extract(epoch from e."end" - e."start")::bigint as duration_seconds,\n        e."start" = e."end" as is_instant,\n        coalesce(m.is_progressive, false) as is_progressive,\n        coalesce(m.is_phase_boundary, false) as is_phase_boundary,\n        tstzrange(e."start", e."end") as span,\n        tstzrange(e."start", e."end", \'[]\') as extent,\n        coalesce(m.tag_ids, \'{}\'::uuid[]) as tag_ids,\n        coalesce(g.direct_tag_ids, \'{}\'::uuid[]) as direct_tag_ids\n    from calendar_events as e\n    left join marks as m on e.id = m.calendar_event_id\n    left join given as g on e.id = g.calendar_event_id\n),\n\nexpanded as (\n    select\n        v.*,\n        null::uuid as tag_id\n    from events as v\n    union all\n    select\n        v.*,\n        k.tag_id\n    from events as v\n    inner join carried as k on v.calendar_event_id = k.calendar_event_id\n),\n\nsums as (\n    select\n        case\n            when grouping(x.calendar_event_id) = 0 then \'event\'\n            when grouping(x."name") = 0 then \'day-tag-name\'\n            when x.tag_id is null then \'day\'\n            else \'day-tag\'\n        end as "filter",\n        x.calendar_event_id,\n        x.local_day,\n        x.is_phase_boundary,\n        x.tag_id,\n        x."name",\n        count(*) as events,\n        count(*) filter (where x.is_instant) as instants,\n        count(*) filter (where not x.is_instant) as spans,\n        coalesce(sum(x.duration_seconds), 0)::bigint as duration_seconds,\n        coalesce(sum(x.duration_seconds) filter (where x.is_progressive), 0)::bigint as progressive_seconds,\n        min(x."start") as first_start,\n        max(x."start") as last_start,\n        range_agg(x.span) as covered_range,\n        coalesce(\n            array_agg(x.duration_seconds order by x.duration_seconds) filter (where not x.is_instant), \'{}\'::bigint[]\n        ) as span_duration_seconds,\n        array_agg(distinct x."name" order by x."name") filter (where x.tag_id is null) as event_names\n    from expanded as x\n    group by grouping sets (\n        (x.calendar_event_id),\n        (x.local_day, x.is_phase_boundary, x.tag_id),\n        (x.local_day, x.is_phase_boundary, x.tag_id, x."name")\n    )\n),\n\ndirects as (\n    select\n        x.local_day,\n        x.is_phase_boundary,\n        x.tag_id,\n        array_agg(distinct d.id order by d.id) as direct_tag_ids\n    from expanded as x\n    cross join lateral unnest(x.direct_tag_ids) as d (id)\n    group by x.local_day, x.is_phase_boundary, x.tag_id\n),\n\nfacts as (\nselect\n    s."filter",\n    s.calendar_event_id,\n    case when s."filter" in (\'event\', \'day-tag-name\') then coalesce(v."name", s."name") end as "name",\n    v."start",\n    v."end",\n    coalesce(v.local_day, s.local_day) as local_day,\n    date_trunc(\'week\', coalesce(v.local_day, s.local_day)::timestamp)::date as local_week,\n    date_trunc(\'month\', coalesce(v.local_day, s.local_day)::timestamp)::date as local_month,\n    date_trunc(\'quarter\', coalesce(v.local_day, s.local_day)::timestamp)::date as local_quarter,\n    extract(year from coalesce(v.local_day, s.local_day))::bigint as local_year,\n    v.local_weekday,\n    v.local_hour,\n    v.is_instant,\n    v.is_progressive,\n    coalesce(v.is_phase_boundary, s.is_phase_boundary) as is_phase_boundary,\n    v.extent,\n    v.tag_ids,\n    case when s."filter" = \'event\' then v.direct_tag_ids else u.direct_tag_ids end as direct_tag_ids,\n    s.tag_id,\n    case when s."filter" = \'day-tag\' then n."name" end as tag_name,\n    case when s."filter" = \'day-tag\' then n.tag_path end as tag_path,\n    case when s."filter" = \'day-tag\' then n.tag_depth end as tag_depth,\n    n.tag_root_id as tag_root_id,\n    case when s."filter" = \'day-tag\' then n.tag_rank end as tag_rank,\n    case when s."filter" = \'event\' then 1 else s.events end as events,\n    case when s."filter" = \'event\' then v.is_instant::int when s."filter" <> \'day-tag-name\' then s.instants end as instants,\n    case when s."filter" = \'event\' then (not v.is_instant)::int when s."filter" <> \'day-tag-name\' then s.spans end as spans,\n    case when s."filter" = \'event\' then v.duration_seconds when s."filter" <> \'day-tag-name\' then s.duration_seconds end as duration_seconds,\n    case\n        when s."filter" = \'event\' then (case when v.is_progressive then v.duration_seconds else 0 end)\n        when s."filter" <> \'day-tag-name\' then s.progressive_seconds\n    end as progressive_seconds,\n    case when s."filter" = \'event\' then v."start" when s."filter" <> \'day-tag-name\' then s.first_start end as first_start,\n    case when s."filter" = \'event\' then v."start" when s."filter" <> \'day-tag-name\' then s.last_start end as last_start,\n    case when s."filter" = \'event\' then tstzmultirange(v.span) when s."filter" <> \'day-tag-name\' then s.covered_range end as covered_range,\n    case\n        when s."filter" = \'event\' then (case when v.is_instant then \'{}\'::bigint[] else array[v.duration_seconds] end)\n        when s."filter" <> \'day-tag-name\' then s.span_duration_seconds\n    end as span_duration_seconds,\n    case when s."filter" = \'day\' then s.event_names end as event_names\nfrom sums as s\nleft join events as v on s.calendar_event_id = v.calendar_event_id\nleft join nodes as n on s.tag_id = n.id\nleft join directs as u\n    on\n        s."filter" in (\'day\', \'day-tag\')\n        and s.local_day = u.local_day\n        and s.is_phase_boundary = u.is_phase_boundary\n        and coalesce(s.tag_id, \'00000000-0000-0000-0000-000000000000\'::uuid) = coalesce(u.tag_id, \'00000000-0000-0000-0000-000000000000\'::uuid)\nwhere not (s."filter" = \'day-tag-name\' and s.tag_id is null)\n)\n\nselect\n    f.*,\n    md5(\n        f."filter" || \'|\' || coalesce(f.calendar_event_id::text, \'\') || \'|\' || coalesce(f.local_day::text, \'\') || \'|\'\n        || f.is_phase_boundary::text || \'|\' || coalesce(f.tag_id::text, \'\') || \'|\' || coalesce(f."name", \'\')\n    )::uuid as row_key\nfrom facts as f',
      ],
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_direct_tag_ids" ON "calendar_event_facts" USING gin  ("direct_tag_ids")  WHERE "filter" = 'event'`,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_tag_ids" ON "calendar_event_facts" USING gin  ("tag_ids")  WHERE "filter" = 'event'`,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_extent" ON "calendar_event_facts" USING gist  ("extent")  WHERE "filter" = 'event'`,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_start" ON "calendar_event_facts"  ("filter", "start") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_weekday_day" ON "calendar_event_facts"  ("filter", "is_phase_boundary", "local_weekday", "local_day") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_name_day" ON "calendar_event_facts"  ("filter", "is_phase_boundary", "name", "local_day") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_year_tag" ON "calendar_event_facts"  ("filter", "is_phase_boundary", "local_year", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_quarter_tag" ON "calendar_event_facts"  ("filter", "is_phase_boundary", "local_quarter", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_month_tag" ON "calendar_event_facts"  ("filter", "is_phase_boundary", "local_month", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_week_tag" ON "calendar_event_facts"  ("filter", "is_phase_boundary", "local_week", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_depth_day" ON "calendar_event_facts"  ("filter", "is_phase_boundary", "tag_depth", "local_day") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_root_day" ON "calendar_event_facts"  ("filter", "is_phase_boundary", "tag_root_id", "local_day", "name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_tag_day" ON "calendar_event_facts"  ("filter", "is_phase_boundary", "tag_id", "local_day", "name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_facts_day" ON "calendar_event_facts"  ("filter", "is_phase_boundary", "local_day", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "calendar_event_facts_row_key" ON "calendar_event_facts"  ("row_key") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_row_key"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_tag_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_root_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_depth_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_week_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_month_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_quarter_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_year_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_name_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_weekday_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_facts_start"`,
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
      `DELETE FROM "caelundas"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ["MATERIALIZED_VIEW", "calendar_event_facts", "caelundas"],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW "calendar_event_facts"`);
    await queryRunner.query(`DROP INDEX "caelundas"."calendar_events_end"`);
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_events_location_start"`,
    );
  }
}
