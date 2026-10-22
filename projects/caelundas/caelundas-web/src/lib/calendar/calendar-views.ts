import { z } from "zod";

import type { CalendarView } from "@codebase/presentation";

/**
 * Every view the calendar offers, in the order the toolbar lists them.
 */
export const CALENDAR_VIEWS = [
  "month",
  "week",
  "three-day",
  "day",
  "agenda",
] as const;

/**
 * A view as the link names it. The app owns this list rather than the
 * vendored calendar's, so a view can be added or cut here alone.
 */
export type CalendarViewName = (typeof CALENDAR_VIEWS)[number];

/**
 * What the toolbar calls each view.
 */
export const CALENDAR_VIEW_LABELS: Readonly<Record<CalendarViewName, string>> =
  {
    agenda: "Agenda",
    day: "Day",
    month: "Month",
    "three-day": "3 Days",
    week: "Week",
  };

/**
 * How an empty notice names the days each view shows.
 */
export const CALENDAR_VIEW_PERIODS: Readonly<Record<CalendarViewName, string>> =
  {
    agenda: "in these days",
    day: "this day",
    month: "this month",
    "three-day": "in these three days",
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

const THREE_DAYS = 3;

const calendarViewSchema = z.enum(CALENDAR_VIEWS);

/**
 * The view to show when the link names none: the agenda, which reads at a
 * phone's width, or the whole month on anything wider.
 */
export function getDefaultCalendarView(isWide: boolean): CalendarViewName {
  return isWide ? "month" : "agenda";
}

/**
 * Reads a value as a view, or nothing when it names none, such as a stale
 * link's or an unpressed toggle's.
 */
export function parseCalendarView(
  value: unknown,
): CalendarViewName | undefined {
  return calendarViewSchema.safeParse(value).data;
}

/**
 * The vendored calendar's view for one of the app's, and how many days it
 * shows when that is the N-day view.
 */
export function toEventCalendarView(view: CalendarViewName): {
  dayCount: number;
  view: CalendarView;
} {
  return view === "three-day"
    ? { dayCount: THREE_DAYS, view: "days" }
    : { dayCount: THREE_DAYS, view };
}
