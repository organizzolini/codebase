import { TimelineScale } from "./timeline-scale.entities";

// ♟️ Constants

/**
 * How many days the agenda lists from the day it opens on.
 */
export const AGENDA_DAY_COUNT = 30;

/** Zone midnights lie up to a day from UTC's. */
export const BUFFER_DAYS = 1;

export const DAY_MILLISECONDS = 86_400_000;

const DAY_MINUTES = 1440;

/** Minutes per timeline column, at each scale. */
export const COLUMN_MINUTES: Readonly<Record<TimelineScale, number>> = {
  [TimelineScale.DAY]: 15,
  [TimelineScale.MONTH]: DAY_MINUTES,
  [TimelineScale.QUARTER]: 7 * DAY_MINUTES,
  [TimelineScale.WEEK]: DAY_MINUTES,
  [TimelineScale.YEAR]: 30.436_875 * DAY_MINUTES,
};

/**
 * The timeline's scale when the request names none.
 */
export const DEFAULT_TIMELINE_SCALE = TimelineScale.MONTH;

/** Most days the agenda lists at once. */
export const MAXIMUM_AGENDA_DAYS = 366;

// The month grid always draws six weeks, so it shows up to six days of the
// previous month and up to fourteen of the next; a whole week either side
// covers both.
export const MONTH_LEADING_DAYS = 7;

export const MONTH_TRAILING_DAYS = 14;

export const THREE_DAYS = 3;

export const WEEK_DAYS = 7;
