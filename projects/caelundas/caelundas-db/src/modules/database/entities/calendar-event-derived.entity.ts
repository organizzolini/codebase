import { ViewColumn, ViewEntity } from "typeorm";

/**
 * One row of the `calendar_events_derived` view: a calendar event with the
 * times derived from its start and end, in UTC: the year, quarter, month,
 * week, weekday, hour and day it starts, how long it lasts in minutes, and
 * whether it is an instant or lasts a while.
 *
 * It is a plain view, since TypeORM's materialized views exist only for
 * Postgres and Oracle: SQLite computes the columns on every read. Local time
 * is not derived here, because SQLite knows no time zones: the API registers
 * functions for it on its own connection.
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
    e.location,
    e.longitude,
    e."start",
    e.summary,
    e.timezone,
    cast(strftime('%Y', e."start") as integer) as start_year,
    cast(strftime('%m', e."start") as integer) as start_month,
    cast(strftime('%W', e."start") as integer) as start_week,
    cast(strftime('%w', e."start") as integer) as start_weekday,
    cast(strftime('%H', e."start") as integer) as start_hour,
    (strftime('%s', e."end") - strftime('%s', e."start")) / 60 as duration_minutes,
    case when e."start" = e."end" then 'Instant' else 'Duration' end as temporality,
    (cast(strftime('%m', e."start") as integer) + 2) / 3 as start_quarter,
    date(e."start") as start_day
from "calendar_events" as e`,
  name: "calendar_events_derived",
})
export class CalendarEventDerived {
  @ViewColumn()
  color!: null | string;

  @ViewColumn()
  createdAt!: string;

  @ViewColumn()
  createdBy!: null | string;

  @ViewColumn()
  description!: string;

  @ViewColumn()
  durationMinutes!: number;

  @ViewColumn()
  end!: string;

  @ViewColumn()
  id!: string;

  @ViewColumn()
  latitude!: string;

  @ViewColumn()
  location!: null | string;

  @ViewColumn()
  longitude!: string;

  @ViewColumn()
  start!: string;

  @ViewColumn()
  startDay!: string;

  @ViewColumn()
  startHour!: number;

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
  updatedAt!: string;

  @ViewColumn()
  updatedBy!: null | string;
}
