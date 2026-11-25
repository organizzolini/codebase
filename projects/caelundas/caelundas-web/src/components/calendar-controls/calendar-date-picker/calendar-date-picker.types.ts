import type { TimelineScale } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";

// 🏷️ Types

/**
 * How a click picks: a day, or a whole week to year.
 */
export type DatePickerMode =
  | "day"
  | "half-year"
  | "month"
  | "quarter"
  | "week"
  | "year";

/**
 * A span of calendar days, both ends included, as `YYYY-MM-DD`.
 */
export interface DateRangeValue {
  from: string;
  to: string;
}

/**
 * What the picker writes: date, table days, timeline scale.
 */
export interface DateWindowSearch {
  date: string;
  days?: number;
  scale?: TimelineScale;
}

/**
 * The modes that pick from a grid of cells.
 */
export type GridMode = Exclude<DatePickerMode, "day" | "week">;

/**
 * One cell of the month, quarter, half-year or year grid.
 */
export interface PeriodCell {
  label: string;
  range: DateRangeValue;
}
