import type { CalendarViewName } from "../../components/events-calendar/calendar-views.types";

// ♟️ Constants

/**
 * Views whose busy days merge; the month has its own list.
 */
export const CLUSTERED_VIEWS: ReadonlySet<CalendarViewName> = new Set([
  "day",
  "three-day",
  "week",
]);

/**
 * Gap and minimum count per view for merging.
 */
export const CLUSTER_TUNING = {
  day: { gapMinutes: 10, minimum: 4 },
  "three-day": { gapMinutes: 15, minimum: 3 },
  week: { gapMinutes: 15, minimum: 2 },
} as const;
