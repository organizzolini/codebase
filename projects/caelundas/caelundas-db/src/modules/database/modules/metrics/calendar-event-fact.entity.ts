import { Index, ViewColumn, ViewEntity } from "typeorm";

/**
 * One row of the materialized view `calendar_event_facts`, the one table the metrics read. `filter` names the grain the row answers (event, day, day-tag or day-tag-name) and every read pins it. Columns a grain does not use are null. Phase boundaries are kept, flagged by `is_phase_boundary`. Refreshed by `refreshMetrics`.
 */
@Index("calendar_event_facts_row_key", ["rowKey"], { unique: true })
@Index("calendar_event_facts_day", [
  "filter",
  "isPhaseBoundary",
  "localDay",
  "tagId",
])
@Index("calendar_event_facts_tag_day", [
  "filter",
  "isPhaseBoundary",
  "tagId",
  "localDay",
  "name",
])
@Index("calendar_event_facts_root_day", [
  "filter",
  "isPhaseBoundary",
  "tagRootId",
  "localDay",
  "name",
])
@Index("calendar_event_facts_depth_day", [
  "filter",
  "isPhaseBoundary",
  "tagDepth",
  "localDay",
])
@Index("calendar_event_facts_week_tag", [
  "filter",
  "isPhaseBoundary",
  "localWeek",
  "tagId",
])
@Index("calendar_event_facts_month_tag", [
  "filter",
  "isPhaseBoundary",
  "localMonth",
  "tagId",
])
@Index("calendar_event_facts_quarter_tag", [
  "filter",
  "isPhaseBoundary",
  "localQuarter",
  "tagId",
])
@Index("calendar_event_facts_year_tag", [
  "filter",
  "isPhaseBoundary",
  "localYear",
  "tagId",
])
@Index("calendar_event_facts_name_day", [
  "filter",
  "isPhaseBoundary",
  "name",
  "localDay",
])
@Index("calendar_event_facts_weekday_day", [
  "filter",
  "isPhaseBoundary",
  "localWeekday",
  "localDay",
])
@Index("calendar_event_facts_start", ["filter", "start"])
@Index("calendar_event_facts_extent", ["extent"], {
  type: "gist",
  where: `"filter" = 'event'`,
})
@Index("calendar_event_facts_tag_ids", ["tagIds"], {
  type: "gin",
  where: `"filter" = 'event'`,
})
@Index("calendar_event_facts_direct_tag_ids", ["directTagIds"], {
  type: "gin",
  where: `"filter" = 'event'`,
})
@ViewEntity({
  expression: `with levels as (
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
from facts as f`,
  materialized: true,
  name: "calendar_event_facts",
})
export class CalendarEventFact {
  /** The event, on an event row. */
  @ViewColumn()
  calendarEventId!: null | string;

  /** Union of the half-open spans, as a multirange. */
  @ViewColumn()
  coveredRange!: null | string;

  /** Tags given directly, sorted; on event, day and day-tag rows. */
  @ViewColumn()
  directTagIds!: null | string[];

  /** Whole seconds, summed; 0 for an instant. */
  @ViewColumn()
  durationSeconds!: null | number;

  /** The end, as stored; on an event row. */
  @ViewColumn()
  end!: Date | null;

  /** Distinct event names of the day, sorted; on day rows. */
  @ViewColumn()
  eventNames!: null | string[];

  /** Events counted: 1 on an event row. */
  @ViewColumn()
  events!: null | number;

  /** Closed range start to end, so overlap is `&&`. */
  @ViewColumn()
  extent!: null | string;

  /** The grain: event, day, day-tag, or day-tag-name. */
  @ViewColumn()
  filter!: string;

  /** Earliest start; not on a day-tag-name row. */
  @ViewColumn()
  firstStart!: Date | null;

  /** Events whose start equals their end. */
  @ViewColumn()
  instants!: null | number;

  /** Whether start equals end; on an event row. */
  @ViewColumn()
  isInstant!: boolean | null;

  /** Whether the event is a Forming or Dissolving phase boundary. */
  @ViewColumn()
  isPhaseBoundary!: boolean;

  /** Whether the event carries the Progressive tag; on an event row. */
  @ViewColumn()
  isProgressive!: boolean | null;

  /** Latest start; not on a day-tag-name row. */
  @ViewColumn()
  lastStart!: Date | null;

  /** Local day of the start, in the event's zone. */
  @ViewColumn()
  localDay!: string;

  /** Local hour of the start, 0 to 23; on an event row. */
  @ViewColumn()
  localHour!: null | number;

  /** First local day of the start's month. */
  @ViewColumn()
  localMonth!: string;

  /** First local day of the start's quarter. */
  @ViewColumn()
  localQuarter!: string;

  /** Monday of the start's local week. */
  @ViewColumn()
  localWeek!: string;

  /** Local weekday of the start, 0 for Sunday; on an event row. */
  @ViewColumn()
  localWeekday!: null | number;

  /** Local year of the start. */
  @ViewColumn()
  localYear!: number;

  /** The event's summary; on event and day-tag-name rows. */
  @ViewColumn()
  name!: null | string;

  /** Seconds of the Progressive events. */
  @ViewColumn()
  progressiveSeconds!: null | number;

  /** Hash of the grain's keys: the not-null unique key for refresh. */
  @ViewColumn()
  rowKey!: string;

  /** Each span's seconds, ascending; not on a day-tag-name row. */
  @ViewColumn()
  spanDurationSeconds!: null | number[];

  /** Events whose end is after their start. */
  @ViewColumn()
  spans!: null | number;

  /** The start, as stored; on an event row. */
  @ViewColumn()
  start!: Date | null;

  /** Ancestors the tag has, so a root is 0; on day-tag rows. */
  @ViewColumn()
  tagDepth!: null | number;

  /** The tag node; empty on event and day rows. */
  @ViewColumn()
  tagId!: null | string;

  /** Every tag carried, ancestors included, sorted; on an event row. */
  @ViewColumn()
  tagIds!: null | string[];

  /** The tag's own label; on day-tag rows. */
  @ViewColumn()
  tagName!: null | string;

  /** The tag's names from its root, joined; on day-tag rows. */
  @ViewColumn()
  tagPath!: null | string;

  /** Padded `rank` then name of each ancestor; on day-tag rows. */
  @ViewColumn()
  tagRank!: null | string;

  /** The root of the tag's dimension; on tag rows. */
  @ViewColumn()
  tagRootId!: null | string;
}
