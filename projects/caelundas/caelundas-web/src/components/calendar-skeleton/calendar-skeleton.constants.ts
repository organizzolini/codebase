import type { CalendarViewName } from "../events-calendar/calendar-views.types";

// ♟️ Constants

const WEEKS = 6;

const DAYS_PER_WEEK = 7;

export const COLUMN_COUNTS = {
  day: 1,
  "three-day": 3,
  week: DAYS_PER_WEEK,
} as const;

export const CELL_KEYS = Array.from(
  { length: WEEKS * DAYS_PER_WEEK },
  (_, index) => `cell-${String(index)}`,
);

export const ROW_KEYS = Array.from(
  { length: 8 },
  (_, index) => `row-${String(index)}`,
);

export const TIMELINE_BARS = [
  "w-1/3 ms-[5%]",
  "w-1/4 ms-[30%]",
  "w-2/5 ms-[10%]",
  "w-1/5 ms-[55%]",
  "w-1/3 ms-[20%]",
  "w-1/4 ms-[45%]",
  "w-1/2 ms-[8%]",
  "w-1/5 ms-[65%]",
] as const;

export const EVENT_HEIGHTS = ["h-8", "h-12", "h-8", "h-16", "h-8"] as const;

/**
 * The layout each view's skeleton takes: a grid for the month, columns for
 * the views of hours, a list for the agenda, bars for the timeline.
 */
export const LAYOUTS: Readonly<
  Record<CalendarViewName, "columns" | "grid" | "list" | "timeline">
> = {
  agenda: "list",
  day: "columns",
  month: "grid",
  "three-day": "columns",
  timeline: "timeline",
  week: "columns",
};
