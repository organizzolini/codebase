import type { GanttScale } from "@codebase/presentation";

export const MINUTE_MILLISECONDS = 60_000;

const DAY_MINUTES = 1440;

/**
 * Marker width in rem, so neighbors do not touch.
 */
export const MARKER_REM = 1.5;

/**
 * Column width per scale at rest, in rem.
 */
export const TIMELINE_UNIT_WIDTHS: Readonly<Record<GanttScale, number>> = {
  day: 2.5,
  month: 4,
  quarter: 8,
  week: 10,
  year: 10,
};

/**
 * Minutes per day column: the Gantt's finest step.
 */
export const TIMELINE_DAY_INTERVAL = 15;

/**
 * Minutes per column of each scale.
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
