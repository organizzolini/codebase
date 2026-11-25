import { Index, ViewColumn, ViewEntity } from "typeorm";

/**
 * One row of the materialized view `calendar_event_day_tag_rollups`: everything the metrics need of the events a tag node covers on one local day, additive counts and sums plus the exact raw material of the rest. Refreshed by `refreshMetrics`.
 */
@Index("calendar_event_day_tag_rollups_day_tag", ["localDay", "tagId"], {
  unique: true,
})
@Index("calendar_event_day_tag_rollups_tag_day", ["tagId", "localDay"])
@Index("calendar_event_day_tag_rollups_root_day", ["tagRootId", "localDay"])
@Index("calendar_event_day_tag_rollups_depth_day", ["tagDepth", "localDay"])
@Index("calendar_event_day_tag_rollups_month_tag", ["localMonth", "tagId"])
@Index("calendar_event_day_tag_rollups_week_tag", ["localWeek", "tagId"])
@Index("calendar_event_day_tag_rollups_quarter_tag", ["localQuarter", "tagId"])
@Index("calendar_event_day_tag_rollups_year_tag", ["localYear", "tagId"])
@ViewEntity({
  expression: `with sums as (
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
ranks as (
    select
        node.id as tag_id,
        string_agg(lpad(a.rank::text, 5, '0') || ':' || a."name", ' / ' order by ancestor_node."depth") as rank
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
    k.rank as tag_rank,
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
inner join ranks as k on s.tag_id = k.tag_id
left join directs as d on s.local_day = d.local_day and s.tag_id = d.tag_id`,
  materialized: true,
  name: "calendar_event_day_tag_rollups",
})
export class CalendarEventDayTagRollup {
  /** Union of the events' half-open spans, a `tstzmultirange`. */
  @ViewColumn()
  coveredRange!: string;

  /** Events that carry this tag itself, not through a descendant. */
  @ViewColumn()
  directEvents!: number;

  /** Tags given directly to events that carry this tag, sorted. */
  @ViewColumn()
  directTagIds!: string[];

  /** Sum of event durations, in whole seconds. */
  @ViewColumn()
  durationSeconds!: number;

  /** Events that carry the tag, directly or through a descendant. */
  @ViewColumn()
  events!: number;

  /** Earliest event start. */
  @ViewColumn()
  firstStart!: Date;

  /** Events whose start equals their end. */
  @ViewColumn()
  instants!: number;

  /** Latest event start. */
  @ViewColumn()
  lastStart!: Date;

  /** Local day of the events' start. */
  @ViewColumn()
  localDay!: string;

  /** First local day of the month. */
  @ViewColumn()
  localMonth!: string;

  /** First local day of the quarter. */
  @ViewColumn()
  localQuarter!: string;

  /** Monday of the local week. */
  @ViewColumn()
  localWeek!: string;

  /** Local year. */
  @ViewColumn()
  localYear!: number;

  /** Duration seconds of the Progressive events. */
  @ViewColumn()
  progressiveSeconds!: number;

  /** Duration seconds of the events that last, sorted ascending. */
  @ViewColumn()
  spanDurationSeconds!: number[];

  /** Events that last. */
  @ViewColumn()
  spans!: number;

  /** Ancestors the tag has, so a root is 0. */
  @ViewColumn()
  tagDepth!: number;

  /** The tag node this row covers. */
  @ViewColumn()
  tagId!: string;

  /** The tag's own label. */
  @ViewColumn()
  tagName!: string;

  /** The tag's names from its root down, joined with ` / `. */
  @ViewColumn()
  tagPath!: string;

  /** Sort key built from the ancestors' ranks and names. */
  @ViewColumn()
  tagRank!: string;

  /** The root of the tag's dimension. */
  @ViewColumn()
  tagRootId!: string;
}
