import { ViewColumn, ViewEntity } from "typeorm";

import type { ColumnType } from "typeorm";

/** Event start, a wall-clock timestamp in the event's zone. */
const LOCAL_START = `(e."start" at time zone e.timezone)`;

/** UTC wall-clock start; every derived time but duration reads it. */
const UTC_START = `(e."start" at time zone 'UTC')`;

/** TypeORM retains these extra options for the ERD generator. */
interface ViewColumnErdOptions {
  name?: string;
  nullable?: boolean;
  type: ColumnType;
}

const INTEGER_VIEW_COLUMN: ViewColumnErdOptions = { type: "integer" };
const NULLABLE_TEXT_VIEW_COLUMN: ViewColumnErdOptions = {
  nullable: true,
  type: "text",
};
const NULLABLE_UUID_VIEW_COLUMN: ViewColumnErdOptions = {
  nullable: true,
  type: "uuid",
};
const NUMERIC_VIEW_COLUMN: ViewColumnErdOptions = { type: "numeric" };
const TEXT_VIEW_COLUMN: ViewColumnErdOptions = { type: "text" };
const TIMESTAMPTZ_VIEW_COLUMN: ViewColumnErdOptions = {
  type: "timestamptz",
};
const UUID_VIEW_COLUMN: ViewColumnErdOptions = { type: "uuid" };

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
  @ViewColumn(NULLABLE_TEXT_VIEW_COLUMN)
  color!: null | string;

  @ViewColumn(TIMESTAMPTZ_VIEW_COLUMN)
  createdAt!: Date;

  @ViewColumn(NULLABLE_UUID_VIEW_COLUMN)
  createdBy!: null | string;

  @ViewColumn(TEXT_VIEW_COLUMN)
  description!: string;

  @ViewColumn(INTEGER_VIEW_COLUMN)
  durationMinutes!: number;

  @ViewColumn(TIMESTAMPTZ_VIEW_COLUMN)
  end!: Date;

  @ViewColumn(UUID_VIEW_COLUMN)
  id!: string;

  @ViewColumn(NUMERIC_VIEW_COLUMN)
  latitude!: string;

  @ViewColumn(NULLABLE_TEXT_VIEW_COLUMN)
  location!: null | string;

  @ViewColumn(NUMERIC_VIEW_COLUMN)
  longitude!: string;

  @ViewColumn(TIMESTAMPTZ_VIEW_COLUMN)
  start!: Date;

  @ViewColumn(TEXT_VIEW_COLUMN)
  startDay!: string;

  @ViewColumn(INTEGER_VIEW_COLUMN)
  startHour!: number;

  @ViewColumn(TEXT_VIEW_COLUMN)
  startLocalDay!: string;

  @ViewColumn(INTEGER_VIEW_COLUMN)
  startLocalHour!: number;

  @ViewColumn(INTEGER_VIEW_COLUMN)
  startMonth!: number;

  @ViewColumn(INTEGER_VIEW_COLUMN)
  startQuarter!: number;

  @ViewColumn(INTEGER_VIEW_COLUMN)
  startWeek!: number;

  @ViewColumn(INTEGER_VIEW_COLUMN)
  startWeekday!: number;

  @ViewColumn(INTEGER_VIEW_COLUMN)
  startYear!: number;

  @ViewColumn(TEXT_VIEW_COLUMN)
  summary!: string;

  @ViewColumn(TEXT_VIEW_COLUMN)
  temporality!: "Duration" | "Instant";

  @ViewColumn(TEXT_VIEW_COLUMN)
  timezone!: string;

  @ViewColumn(TIMESTAMPTZ_VIEW_COLUMN)
  updatedAt!: Date;

  @ViewColumn(NULLABLE_UUID_VIEW_COLUMN)
  updatedBy!: null | string;
}
