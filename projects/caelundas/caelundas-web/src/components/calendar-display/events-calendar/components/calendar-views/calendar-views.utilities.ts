import {
  calendarViewSchema,
  RETIRED_VIEWS,
  timelineScaleSchema,
} from "./calendar-views.constants";

import type { CalendarViewName, TimelineScale } from "./calendar-views.types";
import type { CalendarView } from "@codebase/presentation";

/**
 * The view to show when the link names none: the table, which reads at a
 * phone's width, or the whole month on anything wider.
 */
export function getDefaultCalendarView(isWide: boolean): CalendarViewName {
  return isWide ? "month" : "table";
}

/**
 * Reads a value as a view, or nothing; a retired view's name opens its replacement.
 */
export function parseCalendarView(
  value: unknown,
): CalendarViewName | undefined {
  const name =
    typeof value === "string" ? (RETIRED_VIEWS[value] ?? value) : value;

  return calendarViewSchema.safeParse(name).data;
}

/**
 * Reads a value as a timeline scale, or nothing when it names none.
 */
export function parseTimelineScale(value: unknown): TimelineScale | undefined {
  return timelineScaleSchema.safeParse(value).data;
}

/**
 * The calendar's view for one of the app's; the table and the timeline have none.
 */
export function toEventCalendarView(
  view: Exclude<CalendarViewName, "table" | "timeline">,
): CalendarView {
  return view;
}
