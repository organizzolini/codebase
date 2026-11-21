import type { TimelineScale } from "./timeline-scale.entities";

// 🏷️ Types

/**
 * A half-open span of time, `start` included and `end` not.
 */
export interface Period {
  end: Date;
  start: Date;
}

/** Days shown, and events read for them plus a buffer. */
export interface Windows {
  /**
   * How long one column of a timeline's axis lasts, in minutes; null for a
   * view other than the timeline.
   */
  columnMinutes: null | number;
  read: Period;
  visible: Period;
}

/** Agenda length and timeline scale, which set the days shown. */
export interface WindowsOptions {
  agendaDays?: null | number | undefined;
  scale?: null | TimelineScale | undefined;
}
