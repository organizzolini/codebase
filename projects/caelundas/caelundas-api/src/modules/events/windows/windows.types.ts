import type { TimelineScale } from "./timeline-scale.entities";

// 🏷️ Types

/**
 * A half-open span of time, `start` included and `end` not.
 */
export interface Period {
  end: Date;
  start: Date;
}

/**
 * The days a view shows, and the period of events read for them: those days
 * plus a buffer either side.
 */
export interface Windows {
  /**
   * How long one column of a timeline's axis lasts, in minutes; null for a
   * view other than the timeline.
   */
  columnMinutes: null | number;
  read: Period;
  visible: Period;
}

/**
 * What else decides the days a view shows: how many the agenda lists, and
 * the span the timeline shows at once.
 */
export interface WindowsOptions {
  agendaDays?: null | number | undefined;
  scale?: null | TimelineScale | undefined;
}
