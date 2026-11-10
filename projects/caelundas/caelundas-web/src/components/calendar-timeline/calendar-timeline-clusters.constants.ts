import type { GanttScale } from "@codebase/presentation";

export const MINUTE_MILLISECONDS = 60_000;

const DAY_MINUTES = 1440;

/**
 * Width of a marker on the axis, in rem: a lane's height plus a little, so neighbors do not touch.
 */
export const MARKER_REM = 1.5;

/**
 * Width of one column of each scale at rest, in rem, as the Gantt draws them.
 */
export const TIMELINE_UNIT_WIDTHS: Readonly<Record<GanttScale, number>> = {
  day: 2.5,
  month: 4,
  quarter: 8,
  week: 10,
  year: 10,
};

/**
 * How many minutes each of a day's columns lasts: the fewest the Gantt
 * draws.
 */
export const TIMELINE_DAY_INTERVAL = 15;

/**
 * How long one column of each scale lasts, in minutes, on the Gantt's axis.
 */
export const COLUMN_MINUTES: Readonly<Record<GanttScale, number>> = {
  day: TIMELINE_DAY_INTERVAL,
  month: DAY_MINUTES,
  quarter: 7 * DAY_MINUTES,
  week: DAY_MINUTES,
  year: 30.436_875 * DAY_MINUTES,
};

/**
 * How many characters of the events' names a cluster's title shows.
 */
export const PREVIEW_LENGTH = 28;
