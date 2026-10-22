import { AGENDA_DAY_COUNT, type CalendarViewName } from "./calendar-views";

import type { EventsWindow } from "../events-database/events-database.types";

const DAY_MILLISECONDS = 86_400_000;

// One formatter per zone: the agenda formats every event's day, and building
// a formatter costs far more than using one.
const DATE_FORMATS = new Map<string, Intl.DateTimeFormat>();

// The month grid always draws six weeks, so it shows up to six days of the
// previous month and up to fourteen of the next; a whole week either side
// covers both.
const MONTH_LEADING_DAYS = 7;
const MONTH_TRAILING_DAYS = 14;
const WEEK_DAYS = 7;
const THREE_DAYS = 3;

// A zone's midnight lies within a day of UTC's.
const BUFFER_DAYS = 1;

/**
 * The days a view shows, and the window of events read for them: those days
 * plus a buffer either side.
 */
export interface ViewWindows {
  visible: EventsWindow;
  window: EventsWindow;
}

/**
 * The calendar day a number of days after a `YYYY-MM-DD` one, or before it
 * for a negative number.
 */
export function addCalendarDays(day: string, count: number): string {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, date + count))
    .toISOString()
    .slice(0, "YYYY-MM-DD".length);
}

/**
 * Writes the day an instant falls on in a zone as a `YYYY-MM-DD` search
 * parameter, the way the calendar's navigation hands back that zone's
 * midnight.
 */
export function formatCalendarDate(date: Date, timeZone: string): string {
  let format = DATE_FORMATS.get(timeZone);

  if (format === undefined) {
    // Canadian English writes dates in ISO order.
    format = new Intl.DateTimeFormat("en-CA", { timeZone });
    DATE_FORMATS.set(timeZone, format);
  }

  return format.format(date);
}

/**
 * The days a view shows around the day it opens on, as UTC midnights, and
 * the window read for them, a day wider either side: a zone's midnight lies
 * up to a day from UTC's, so the buffer holds every event the zone's days
 * show. Only these days are read, whatever the data spans; the agenda's
 * count of days is clamped where the search is read.
 *
 * With no view, the default rests on the width and changes with it, so the
 * windows cover both defaults and a resize needs no reload.
 */
export function getViewWindows(
  view: CalendarViewName | undefined,
  anchor: Date,
  agendaDays = AGENDA_DAY_COUNT,
): ViewWindows {
  if (view === undefined) {
    const month = getViewWindows("month", anchor);
    const agenda = getViewWindows("agenda", anchor, agendaDays);

    return {
      visible: joinWindows(month.visible, agenda.visible),
      window: joinWindows(month.window, agenda.window),
    };
  }

  const visible = getVisibleDays(view, anchor, agendaDays);

  return {
    visible,
    window: {
      end: shiftDays(visible.end, BUFFER_DAYS),
      start: shiftDays(visible.start, -BUFFER_DAYS),
    },
  };
}

/**
 * Reads a `YYYY-MM-DD` search parameter as the day the calendar shows,
 * defaulting to today's date where the page is open.
 */
export function parseCalendarDate(date: string | undefined, today: Date): Date {
  if (date === undefined) {
    return anchorDay(today.getFullYear(), today.getMonth(), today.getDate());
  }

  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);

  return anchorDay(year, month - 1, day);
}

/**
 * Anchors a calendar day at noon UTC, which falls on that same day in every
 * zone from UTC-11 to UTC+11.
 */
function anchorDay(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day, 12));
}

/**
 * The days a view shows, from UTC midnight to UTC midnight.
 */
function getVisibleDays(
  view: CalendarViewName,
  anchor: Date,
  agendaDays: number,
): EventsWindow {
  const day = new Date(
    Date.UTC(
      anchor.getUTCFullYear(),
      anchor.getUTCMonth(),
      anchor.getUTCDate(),
    ),
  );

  if (view === "month") {
    const first = new Date(
      Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
    );
    const next = new Date(
      Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 1),
    );

    return {
      end: shiftDays(next, MONTH_TRAILING_DAYS),
      start: shiftDays(first, -MONTH_LEADING_DAYS),
    };
  }

  if (view === "week") {
    // Weeks start on Sunday, as the calendar draws them.
    const sunday = shiftDays(day, -day.getUTCDay());

    return { end: shiftDays(sunday, WEEK_DAYS), start: sunday };
  }

  const length = { agenda: agendaDays, day: 1, "three-day": THREE_DAYS }[view];

  return { end: shiftDays(day, length), start: day };
}

/**
 * The smallest window holding two.
 */
function joinWindows(left: EventsWindow, right: EventsWindow): EventsWindow {
  return {
    end: new Date(Math.max(left.end.getTime(), right.end.getTime())),
    start: new Date(Math.min(left.start.getTime(), right.start.getTime())),
  };
}

/**
 * An instant a number of whole days later, or earlier for a negative one.
 */
function shiftDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MILLISECONDS);
}
