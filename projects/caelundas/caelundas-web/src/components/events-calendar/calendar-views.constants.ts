import { z } from "zod";

/**
 * Every view the calendar offers, in the order the toolbar lists them.
 */
export const CALENDAR_VIEWS = [
  "month",
  "week",
  "three-day",
  "day",
  "agenda",
  "timeline",
] as const;

/**
 * What the toolbar calls each view.
 */
export const CALENDAR_VIEW_LABELS: Readonly<
  Record<(typeof CALENDAR_VIEWS)[number], string>
> = {
  agenda: "Agenda",
  day: "Day",
  month: "Month",
  "three-day": "3 Days",
  timeline: "Timeline",
  week: "Week",
};

/**
 * How an empty notice names the days each view shows.
 */
export const CALENDAR_VIEW_PERIODS: Readonly<
  Record<(typeof CALENDAR_VIEWS)[number], string>
> = {
  agenda: "in these days",
  day: "this day",
  month: "this month",
  "three-day": "in these three days",
  timeline: "in this period",
  week: "this week",
};

/**
 * How many days the agenda lists from the day it opens on.
 */
export const AGENDA_DAY_COUNT = 30;

/**
 * The most days the agenda lists at once, however far it is scrolled.
 */
export const MAXIMUM_AGENDA_DAYS = 366;

/**
 * The spans the timeline shows at once, from the finest to the coarsest.
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

export const THREE_DAYS = 3;

export const calendarViewSchema = z.enum(CALENDAR_VIEWS);

export const timelineScaleSchema = z.enum(TIMELINE_SCALES);
