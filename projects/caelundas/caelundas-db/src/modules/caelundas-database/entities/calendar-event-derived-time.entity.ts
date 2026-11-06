import { ViewColumn, ViewEntity } from "typeorm";

/** The event's start as the wall-clock `timestamp` in the zone the event names, so a reader groups and filters by the observer's local day and hour. */
const LOCAL_START = `(e."start" at time zone e.timezone)`;

/** The event's start as a UTC wall-clock `timestamp`, which every derived time but the duration reads. */
const UTC_START = `(e."start" at time zone 'UTC')`;

/**
 * One row of the `calendar_event_derived_times` view: a calendar event with the
 * times derived from its start and end, in UTC: the year, quarter, month,
 * week, weekday, hour and day it starts, how long it lasts in minutes, and
 * whether it is an instant or lasts a while. The day and hour it starts in the
 * observer's own zone, `start_local_day` and `start_local_hour`, come from
 * `start AT TIME ZONE timezone`.
 *
 * It is a plain view rather than a materialized one: the columns are cheap to
 * compute from the event's own row, so a reader pays nothing to keep it
 * current, and it needs no refresh. Every column is plain SQL on the event's
 * own `start`, `end`, and `timezone`, so nothing is registered on the
 * connection. Its name is plural already, so the shared naming strategy
 * leaves it be.
 */
@ViewEntity({
  expression: `select
    e.id,
    e.created_at,
    e.created_by,
    e.updated_at,
    e.updated_by,
    e.color,
    e.description,
    e."end",
    e.latitude,
    e."location",
    e.longitude,
    e."start",
    e."summary",
    e.timezone,
    extract(year from ${UTC_START})::integer as start_year,
    extract(quarter from ${UTC_START})::integer as start_quarter,
    extract(month from ${UTC_START})::integer as start_month,
    floor((extract(doy from ${UTC_START}) + 6 - mod(extract(dow from ${UTC_START}) + 6, 7)) / 7)::integer as start_week,
    extract(dow from ${UTC_START})::integer as start_weekday,
    extract(hour from ${UTC_START})::integer as start_hour,
    ${UTC_START}::date::text as start_day,
    ${LOCAL_START}::date::text as start_local_day,
    extract(hour from ${LOCAL_START})::integer as start_local_hour,
    floor(extract(epoch from e."end" - e."start") / 60)::integer as duration_minutes,
    case when e."start" = e."end" then 'Instant' else 'Duration' end as temporality
from calendar_events as e`,
  name: "calendar_event_derived_times",
})
export class CalendarEventDerivedTime {
  @ViewColumn()
  color!: null | string;

  @ViewColumn()
  createdAt!: Date;

  @ViewColumn()
  createdBy!: null | string;

  @ViewColumn()
  description!: string;

  @ViewColumn()
  durationMinutes!: number;

  @ViewColumn()
  end!: Date;

  @ViewColumn()
  id!: string;

  @ViewColumn()
  latitude!: string;

  @ViewColumn()
  location!: null | string;

  @ViewColumn()
  longitude!: string;

  @ViewColumn()
  start!: Date;

  @ViewColumn()
  startDay!: string;

  @ViewColumn()
  startHour!: number;

  @ViewColumn()
  startLocalDay!: string;

  @ViewColumn()
  startLocalHour!: number;

  @ViewColumn()
  startMonth!: number;

  @ViewColumn()
  startQuarter!: number;

  @ViewColumn()
  startWeek!: number;

  @ViewColumn()
  startWeekday!: number;

  @ViewColumn()
  startYear!: number;

  @ViewColumn()
  summary!: string;

  @ViewColumn()
  temporality!: "Duration" | "Instant";

  @ViewColumn()
  timezone!: string;

  @ViewColumn()
  updatedAt!: Date;

  @ViewColumn()
  updatedBy!: null | string;
}
