import type { CalendarViewName } from "../events-calendar/components/calendar-views/calendar-views.types";

// ♟️ Constants

const WEEKS = 6;

const DAYS_PER_WEEK = 7;

export const COLUMN_COUNTS = {
  day: 1,
  week: DAYS_PER_WEEK,
} as const;

export const CELL_KEYS = Array.from(
  { length: WEEKS * DAYS_PER_WEEK },
  (_, index) => `cell-${String(index)}`,
);

export const ROW_KEYS = Array.from(
  { length: 24 },
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
 * Each view's skeleton layout: grid, columns, list, bars, cards, or timeline.
 */
export const LAYOUTS: Readonly<
  Record<
    CalendarViewName,
    "bars" | "cards" | "columns" | "grid" | "list" | "timeline"
  >
> = {
  charts: "bars",
  day: "columns",
  month: "grid",
  table: "list",
  timeline: "timeline",
  totals: "cards",
  week: "columns",
};

export const BAR_HEIGHTS = [
  "h-1/3",
  "h-2/3",
  "h-1/2",
  "h-5/6",
  "h-2/5",
] as const;

export const CARD_KEYS = Array.from(
  { length: 8 },
  (_, index) => `card-${String(index)}`,
);
