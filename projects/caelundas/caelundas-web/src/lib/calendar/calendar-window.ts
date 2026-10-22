import type { EventsWindow } from "../events-database/events-database.types";

const DAY_MILLISECONDS = 86_400_000;

// The month grid always draws six weeks, so it shows up to six days of the
// previous month and up to fourteen of the next. One more day on each side
// covers any zone's offset from UTC.
const LEADING_DAYS = 8;
const TRAILING_DAYS = 15;

/**
 * Writes the day an instant falls on in a zone as a `YYYY-MM-DD` search
 * parameter, the way the calendar's navigation hands back that zone's
 * midnight.
 */
export function formatCalendarDate(date: Date, timeZone: string): string {
  // Canadian English writes dates in ISO order.
  return date.toLocaleDateString("en-CA", { timeZone });
}

/**
 * The window of events a month view needs: the month itself plus every
 * neighboring day its grid can show.
 */
export function getMonthWindow(anchor: Date): EventsWindow {
  const year = anchor.getUTCFullYear();
  const monthIndex = anchor.getUTCMonth();

  return {
    end: new Date(
      Date.UTC(year, monthIndex + 1, 1) + TRAILING_DAYS * DAY_MILLISECONDS,
    ),
    start: new Date(
      Date.UTC(year, monthIndex, 1) - LEADING_DAYS * DAY_MILLISECONDS,
    ),
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
