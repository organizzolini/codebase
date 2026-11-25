import { Index, ViewColumn, ViewEntity } from "typeorm";

/**
 * One row of the materialized view `calendar_event_facts`: an event that counts toward the metrics, with its local calendar periods, whole-second duration, spans and tag ids denormalized for the rollups and any raw metric query. Events tagged as a phase forming or dissolving are left out. Refreshed by `refreshMetrics`.
 */
@Index("calendar_event_facts_calendar_event_id", ["calendarEventId"], {
  unique: true,
})
@Index("calendar_event_facts_local_day", ["localDay"])
@Index("calendar_event_facts_local_day_hour", ["localDay", "localHour"])
@Index("calendar_event_facts_local_weekday", ["localWeekday", "localDay"])
@Index("calendar_event_facts_start", ["start"])
@Index("calendar_event_facts_name_day", ["name", "localDay"])
@Index("calendar_event_facts_extent", ["extent"], { type: "gist" })
@Index("calendar_event_facts_tag_ids", ["tagIds"], { type: "gin" })
@Index("calendar_event_facts_direct_tag_ids", ["directTagIds"], { type: "gin" })
@ViewEntity({
  expression: `with tag_facts as (
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
where not coalesce(t.is_excluded, false)`,
  materialized: true,
  name: "calendar_event_facts",
})
export class CalendarEventFact {
  /** The event this row describes; the view's unique key. */
  @ViewColumn()
  calendarEventId!: string;

  /** Tag ids the event carries directly, sorted. */
  @ViewColumn()
  directTagIds!: string[];

  /** Whole seconds from start to end, 0 for an instant. */
  @ViewColumn()
  durationSeconds!: number;

  /** The end, as stored. */
  @ViewColumn()
  end!: Date;

  /** Closed range start to end, so an overlap test is `&&`. */
  @ViewColumn()
  extent!: string;

  /** Whether start equals end. */
  @ViewColumn()
  isInstant!: boolean;

  /** Whether the event carries the Progressive tag. */
  @ViewColumn()
  isProgressive!: boolean;

  /** Local day of the start, in the event's zone. */
  @ViewColumn()
  localDay!: string;

  /** Local hour of the start, 0 to 23. */
  @ViewColumn()
  localHour!: number;

  /** First local day of the start's month. */
  @ViewColumn()
  localMonth!: string;

  /** First local day of the start's quarter. */
  @ViewColumn()
  localQuarter!: string;

  /** Monday of the start's local week. */
  @ViewColumn()
  localWeek!: string;

  /** Local weekday of the start, 0 for Sunday. */
  @ViewColumn()
  localWeekday!: number;

  /** Local year of the start. */
  @ViewColumn()
  localYear!: number;

  /** The event's summary. */
  @ViewColumn()
  name!: string;

  /** Half-open range start to end, empty for an instant. */
  @ViewColumn()
  span!: string;

  /** The start, as stored. */
  @ViewColumn()
  start!: Date;

  /** Tag ids the event carries, ancestors included, sorted. */
  @ViewColumn()
  tagIds!: string[];
}
