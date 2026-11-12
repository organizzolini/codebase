import {
  AGENDA_DAY_COUNT,
  DEFAULT_TIMELINE_SCALE,
  THREE_DAYS,
} from "./calendar-views.constants";
import {
  BUFFER_DAYS,
  DATE_FORMATS,
  DAY_MILLISECONDS,
  MONTH_LEADING_DAYS,
  MONTH_TRAILING_DAYS,
  WEEK_DAYS,
} from "./calendar-window.constants";

import type { Period } from "./calendar-records.types";
import type { CalendarViewName, TimelineScale } from "./calendar-views.types";
import type { ViewWindowOptions, ViewWindows } from "./calendar-window.types";

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
 * Writes the zone's calendar day for an instant as `YYYY-MM-DD`, the search
 * parameter's form.
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
 * The view's days as UTC midnights, and the period read around them. With no
 * view, both width defaults are covered.
 */
export function getViewWindows(
  view: CalendarViewName | undefined,
  anchor: Date,
  options: ViewWindowOptions = {},
): ViewWindows {
  if (view === undefined) {
    const month = getViewWindows("month", anchor);
    const agenda = getViewWindows("agenda", anchor, options);

    return {
      read: joinPeriods(month.read, agenda.read),
      visible: joinPeriods(month.visible, agenda.visible),
    };
  }

  const visible =
    view === "timeline"
      ? getTimelineDays(options.scale ?? DEFAULT_TIMELINE_SCALE, anchor)
      : getVisibleDays(view, anchor, options.agendaDays ?? AGENDA_DAY_COUNT);

  return {
    read: {
      end: shiftDays(visible.end, BUFFER_DAYS),
      start: shiftDays(visible.start, -BUFFER_DAYS),
    },
    visible,
  };
}

/**
 * Whether a day, as `YYYY-MM-DD`, is among those a view shows around the day
 * it opens on.
 */
export function isDayShown(
  day: string,
  shown: Readonly<{
    anchor: Date;
    options?: ViewWindowOptions;
    view: CalendarViewName;
  }>,
): boolean {
  const { visible } = getViewWindows(shown.view, shown.anchor, shown.options);

  // The days are UTC midnights standing for calendar days, so their ISO dates
  // are the days the view shows.
  return (
    day >= visible.start.toISOString().slice(0, 10) &&
    day <= new Date(visible.end.getTime() - 1).toISOString().slice(0, 10)
  );
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
 * The timeline's axis days at a scale, from Sunday for weeks and in whole
 * weeks for quarters.
 */
function getTimelineDays(scale: TimelineScale, anchor: Date): Period {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  const day = new Date(Date.UTC(year, month, anchor.getUTCDate()));

  if (scale === "day") {
    return { end: shiftDays(day, 1), start: day };
  }

  if (scale === "week") {
    const sunday = shiftDays(day, -day.getUTCDay());

    return { end: shiftDays(sunday, WEEK_DAYS), start: sunday };
  }

  if (scale === "month") {
    return {
      end: new Date(Date.UTC(year, month + 1, 1)),
      start: new Date(Date.UTC(year, month, 1)),
    };
  }

  if (scale === "quarter") {
    const first = new Date(Date.UTC(year, month - (month % 3), 1));
    const next = new Date(Date.UTC(year, month - (month % 3) + 3, 1));

    return {
      end: shiftDays(next, (WEEK_DAYS - next.getUTCDay()) % WEEK_DAYS),
      start: shiftDays(first, -first.getUTCDay()),
    };
  }

  return {
    end: new Date(Date.UTC(year + 1, 0, 1)),
    start: new Date(Date.UTC(year, 0, 1)),
  };
}

/**
 * The days a view shows, from UTC midnight to UTC midnight.
 */
function getVisibleDays(
  view: Exclude<CalendarViewName, "timeline">,
  anchor: Date,
  agendaDays: number,
): Period {
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
 * The smallest period holding two.
 */
function joinPeriods(left: Period, right: Period): Period {
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
