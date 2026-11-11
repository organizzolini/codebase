import type {
  CALENDAR_VIEWS,
  TIMELINE_SCALES,
} from "./calendar-views.constants";

/**
 * A link view name; the constants list defines the views.
 */
export type CalendarViewName = (typeof CALENDAR_VIEWS)[number];

/**
 * A span the timeline shows at once, as the link names it.
 */
export type TimelineScale = (typeof TIMELINE_SCALES)[number];
