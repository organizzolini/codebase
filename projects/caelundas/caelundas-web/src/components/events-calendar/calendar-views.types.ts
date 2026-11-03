import type {
  CALENDAR_VIEWS,
  TIMELINE_SCALES,
} from "./calendar-views.constants";

/**
 * A view as the link names it. The app owns this list rather than the
 * vendored calendar's, so a view can be added or cut here alone.
 */
export type CalendarViewName = (typeof CALENDAR_VIEWS)[number];

/**
 * A span the timeline shows at once, as the link names it.
 */
export type TimelineScale = (typeof TIMELINE_SCALES)[number];
