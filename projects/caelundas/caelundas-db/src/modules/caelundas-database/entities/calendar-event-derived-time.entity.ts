import { ViewColumn, ViewEntity } from "typeorm";

/** The event's start as a wall-clock timestamp in the event's own zone, so reads group by local day and hour. */
const LOCAL_START = `(e."start" at time zone e.timezone)`;

/** The event's start as a UTC wall-clock `timestamp`, which every derived time but the duration reads. */
const UTC_START = `(e."start" at time zone 'UTC')`;

/**
 * One row of the `calendar_event_derived_times` view: an event with times derived from its start and end. Plain view, so no refresh.
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
