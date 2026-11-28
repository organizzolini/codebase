import {
  calendarViewSchema,
  METRIC_VIEWS,
  RETIRED_VIEWS,
  timelineScaleSchema,
} from "./calendar-views.constants";

import type {
  CalendarViewName,
  GridViewName,
  MetricViewName,
  TimelineScale,
} from "./calendar-views.types";
import type { CalendarView } from "@codebase/presentation";

/**
 * The view to show when the link names none: the table, which reads at a
 * phone's width, or the whole month on anything wider.
 */
export function getDefaultCalendarView(isWide: boolean): CalendarViewName {
  return isWide ? "month" : "table";
}

/**
 * Whether a view measures the events, drawing metrics and not the events.
 */
export function isMetricView(
  view: CalendarViewName | undefined,
): view is MetricViewName {
  return (
    view !== undefined && (METRIC_VIEWS as readonly string[]).includes(view)
  );
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
 * The calendar's view for one of the app's; the table, timeline and metric layouts have none.
 */
export function toEventCalendarView(view: GridViewName): CalendarView {
  return view;
}
