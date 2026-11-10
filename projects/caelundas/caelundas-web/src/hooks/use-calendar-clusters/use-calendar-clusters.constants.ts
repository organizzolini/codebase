import type { CalendarViewName } from "../../components/events-calendar/calendar-views.types";

// ♟️ Constants

/**
 * Views whose busy days merge: the month has its own "+N more", the others list or group events.
 */
export const CLUSTERED_VIEWS: ReadonlySet<CalendarViewName> = new Set([
  "day",
  "three-day",
  "week",
]);

/**
 * How close events must start to merge: a day needs a crowd; a week, and a phone, merge close pairs.
 */
export const CLUSTER_TUNING = {
  day: { gapMinutes: 10, minimum: 4 },
  "three-day": { gapMinutes: 15, minimum: 3 },
  week: { gapMinutes: 15, minimum: 2 },
} as const;
