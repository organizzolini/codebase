import { z } from "zod";

/**
 * Every view the calendar offers, in the order the toolbar lists them.
 */
export const CALENDAR_VIEWS = [
  "month",
  "week",
  "day",
  "table",
  "charts",
  "totals",
  "timeline",
] as const;

/**
 * What the toolbar calls each view.
 */
export const CALENDAR_VIEW_LABELS: Readonly<
  Record<(typeof CALENDAR_VIEWS)[number], string>
> = {
  charts: "Charts",
  day: "Day",
  month: "Month",
  table: "Table",
  timeline: "Timeline",
  totals: "Totals",
  week: "Week",
};

/**
 * How an empty notice names the days each view shows.
 */
export const CALENDAR_VIEW_PERIODS: Readonly<
  Record<(typeof CALENDAR_VIEWS)[number], string>
> = {
  charts: "in these days",
  day: "this day",
  month: "this month",
  table: "in these days",
  timeline: "in this period",
  totals: "in these days",
  week: "this week",
};

/**
 * The layouts that measure the table's days instead of listing them.
 */
export const METRIC_VIEWS = ["charts", "totals"] as const;

/**
 * How many days the table lists from the day it opens on.
 */
export const AGENDA_DAY_COUNT = 30;

/**
 * The most days the table lists at once.
 */
export const MAXIMUM_AGENDA_DAYS = 366;

/**
 * Timeline spans, finest to coarsest.
 */
export const TIMELINE_SCALES = [
  "day",
  "week",
  "month",
  "quarter",
  "year",
] as const;

/**
 * What the toolbar calls each of the timeline's scales.
 */
export const TIMELINE_SCALE_LABELS: Readonly<
  Record<(typeof TIMELINE_SCALES)[number], string>
> = {
  day: "Day",
  month: "Month",
  quarter: "Quarter",
  week: "Week",
  year: "Year",
};

/**
 * The timeline's scale when the link names none.
 */
export const DEFAULT_TIMELINE_SCALE: (typeof TIMELINE_SCALES)[number] = "month";

export const calendarViewSchema = z.enum(CALENDAR_VIEWS);

/**
 * Retired view names and the views they open.
 */
export const RETIRED_VIEWS: Readonly<Record<string, string>> = {
  agenda: "table",
  "three-day": "week",
};

export const timelineScaleSchema = z.enum(TIMELINE_SCALES);
