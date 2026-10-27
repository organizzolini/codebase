import type { CalendarViewName } from "../../types/calendar-views.types";

// ♟️ Constants

/**
 * The views that draw events on a grid of hours, where a busy day needs
 * merging: the month has its own "+N more", and the agenda and timeline list
 * and group.
 */
export const CLUSTERED_VIEWS: ReadonlySet<CalendarViewName> = new Set([
  "day",
  "three-day",
  "week",
]);

/**
 * How readily each view merges: events merge only when they start within a
 * quarter of an hour of the first of the cluster. A day has room for many
 * events side by side, so it merges only a crowd, and a shorter gap apart; a
 * week has seven narrow columns, so it merges any two close events. A phone's
 * one narrow column merges as the week does.
 */
export const CLUSTER_TUNING = {
  day: { gapMinutes: 10, minimum: 4 },
  "three-day": { gapMinutes: 15, minimum: 3 },
  week: { gapMinutes: 15, minimum: 2 },
} as const;
