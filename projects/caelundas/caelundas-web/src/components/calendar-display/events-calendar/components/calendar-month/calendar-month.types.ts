import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";

// 🏷️ Types

/**
 * A view that shows a day: its day, week or month.
 */
export type DayLevel = "day" | "month" | "week";

/**
 * Asks for the view below a day, with the day as `YYYY-MM-DD`.
 */
export type DayOpener = (view: DayLevel, day: string) => void;

/**
 * The days a month draws, by week, and its own ends.
 */
export interface MonthGrid {
  firstDay: string;
  lastDay: string;
  weeks: string[][];
}

/**
 * The month's events by day, and those running through all of it.
 */
export interface MonthIndex {
  allMonth: CalendarEventRecord[];
  byDay: Map<string, CalendarEventRecord[]>;
}
