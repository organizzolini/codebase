import {
  calendarViewSchema,
  THREE_DAYS,
  timelineScaleSchema,
} from "../constants/calendar-views.constants";

import type {
  CalendarViewName,
  TimelineScale,
} from "../types/calendar-views.types";
import type { CalendarView } from "@codebase/presentation";

/**
 * The view to show when the link names none: the agenda, which reads at a
 * phone's width, or the whole month on anything wider.
 */
export function getDefaultCalendarView(isWide: boolean): CalendarViewName {
  return isWide ? "month" : "agenda";
}

/**
 * Reads a value as a view, or nothing when it names none, such as a stale
 * link's or an unpressed toggle's.
 */
export function parseCalendarView(
  value: unknown,
): CalendarViewName | undefined {
  return calendarViewSchema.safeParse(value).data;
}

/**
 * Reads a value as a timeline scale, or nothing when it names none.
 */
export function parseTimelineScale(value: unknown): TimelineScale | undefined {
  return timelineScaleSchema.safeParse(value).data;
}

/**
 * The vendored calendar's view for one of the app's, and how many days it
 * shows when that is the N-day view. The timeline is the Gantt's rather than
 * the calendar's, so it has none.
 */
export function toEventCalendarView(
  view: Exclude<CalendarViewName, "timeline">,
): {
  dayCount: number;
  view: CalendarView;
} {
  if (view === "three-day") {
    return { dayCount: THREE_DAYS, view: "days" };
  }

  return { dayCount: THREE_DAYS, view };
}
