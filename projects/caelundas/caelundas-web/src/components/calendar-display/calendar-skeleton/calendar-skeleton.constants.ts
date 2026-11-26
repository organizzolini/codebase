import { listKeys } from "./calendar-skeleton.utilities";

import type { CalendarViewName } from "../events-calendar/components/calendar-views/calendar-views.types";

// ♟️ Constants

const DAYS_PER_WEEK = 7;

export const COLUMN_COUNTS = {
  day: 1,
  week: DAYS_PER_WEEK,
} as const;

/**
 * Stills every pulse for a reader who asked for less motion.
 */
export const REDUCED_MOTION =
  "motion-reduce:[&_[data-slot=skeleton]]:animate-none";

/**
 * Each chart's column heights, as shares of the plot's.
 */
export const CHART_COLUMNS: readonly (readonly number[])[] = [
  [78, 84, 8, 10, 2, 7, 92],
  [68, 86, 6, 12, 3, 10, 100],
  [60, 92, 5, 14, 2, 9, 88],
  [45, 72, 10, 8, 4, 12, 64],
];

export const CHART_KEYS = listKeys("chart", CHART_COLUMNS.length);

export const CARD_KEYS = listKeys("card", 6);

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
