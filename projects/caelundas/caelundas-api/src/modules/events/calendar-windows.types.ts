import type { TimelineScale } from "./timeline-scale.entities";

// 🏷️ Types

/**
 * What else decides the days a view shows: how many the agenda lists, and
 * the span the timeline shows at once.
 */
export interface CalendarWindowOptions {
  agendaDays?: null | number | undefined;
  scale?: null | TimelineScale | undefined;
}

/**
 * The days a view shows, and the window of events read for them: those days
 * plus a buffer either side.
 */
export interface CalendarWindows {
  /**
   * How long one column of a timeline's axis lasts, in minutes; null for a
   * view other than the timeline.
   */
  columnMinutes: null | number;
  visible: TimeWindow;
  window: TimeWindow;
}

/**
 * A half-open span of time, `start` included and `end` not.
 */
export interface TimeWindow {
  end: Date;
  start: Date;
}
