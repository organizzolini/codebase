import type {
  CALENDAR_VIEWS,
  METRIC_VIEWS,
  TIMELINE_SCALES,
} from "./calendar-views.constants";

/**
 * A link view name; the constants list defines the views.
 */
export type CalendarViewName = (typeof CALENDAR_VIEWS)[number];

/**
 * A view the event calendar draws; the rest are the app's.
 */
export type GridViewName = Exclude<
  CalendarViewName,
  "table" | "timeline" | MetricViewName
>;

/**
 * A layout of metrics about the events, not the events.
 */
export type MetricViewName = (typeof METRIC_VIEWS)[number];

/**
 * A span the timeline shows at once, as the link names it.
 */
export type TimelineScale = (typeof TIMELINE_SCALES)[number];
