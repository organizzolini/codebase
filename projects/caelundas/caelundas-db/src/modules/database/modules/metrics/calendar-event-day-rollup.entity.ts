import { Index, ViewColumn, ViewEntity } from "typeorm";

/**
 * One row of the materialized view `calendar_event_day_rollups`: everything the metrics need of all the events of one local day, with no tag, so the whole set's totals read one row per day. Refreshed by `refreshMetrics`.
 */
@Index("calendar_event_day_rollups_day", ["localDay"], { unique: true })
@Index("calendar_event_day_rollups_month", ["localMonth"])
@Index("calendar_event_day_rollups_week", ["localWeek"])
@Index("calendar_event_day_rollups_quarter", ["localQuarter"])
@Index("calendar_event_day_rollups_year", ["localYear"])
@ViewEntity({
  expression: `with directs as (
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
left join directs as d on s.local_day = d.local_day`,
  materialized: true,
  name: "calendar_event_day_rollups",
})
export class CalendarEventDayRollup {
  /** Union of the events' half-open spans, a `tstzmultirange`. */
  @ViewColumn()
  coveredRange!: string;

  /** Tags carried directly by that day's events, sorted. */
  @ViewColumn()
  directTagIds!: string[];

  /** Sum of event durations, in whole seconds. */
  @ViewColumn()
  durationSeconds!: number;

  /** Distinct event names that day, sorted. */
  @ViewColumn()
  eventNames!: string[];

  /** Events that day. */
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
}
