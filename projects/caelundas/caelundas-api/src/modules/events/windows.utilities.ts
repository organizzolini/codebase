import { CalendarWindow } from "./calendar-window.entities";
import { TimelineScale } from "./timeline-scale.entities";
import {
  AGENDA_DAY_COUNT,
  BUFFER_DAYS,
  COLUMN_MINUTES,
  DAY_MILLISECONDS,
  DEFAULT_TIMELINE_SCALE,
  MAXIMUM_AGENDA_DAYS,
  MONTH_LEADING_DAYS,
  MONTH_TRAILING_DAYS,
  THREE_DAYS,
  WEEK_DAYS,
} from "./windows.constants";

import type { Period, Windows, WindowsOptions } from "./windows.types";

/**
 * The days a view shows around the day it opens on, as UTC midnights, and
 * the period read for them, a day wider either side: a zone's midnight lies
 * up to a day from UTC's, so the buffer holds every event the zone's days
 * show. Only these days are read, whatever the data spans; the agenda's
 * count of days is held to 1 through 366. A timeline also answers how long
 * one column of its axis lasts.
 *
 * With no view, the windows cover the month and the agenda both, so a resize
 * between them needs no reload.
 */
export function getWindows(
  calendarWindow: CalendarWindow | null | undefined,
  anchor: Date,
  options: WindowsOptions = {},
): Windows {
  if (calendarWindow === undefined || calendarWindow === null) {
    const month = getWindows(CalendarWindow.MONTH, anchor);
    const agenda = getWindows(CalendarWindow.AGENDA, anchor, options);

    return {
      columnMinutes: null,
      read: joinPeriods(month.read, agenda.read),
      visible: joinPeriods(month.visible, agenda.visible),
    };
  }

  const scale = options.scale ?? DEFAULT_TIMELINE_SCALE;
  const visible =
    calendarWindow === CalendarWindow.TIMELINE
      ? getTimelineDays(scale, anchor)
      : getVisibleDays(calendarWindow, anchor, options.agendaDays);

  return {
    columnMinutes:
      calendarWindow === CalendarWindow.TIMELINE ? COLUMN_MINUTES[scale] : null,
    read: {
      end: shiftDays(visible.end, BUFFER_DAYS),
      start: shiftDays(visible.start, -BUFFER_DAYS),
    },
    visible,
  };
}

/**
 * The days the timeline's axis spans at a scale, as the Gantt lays them
 * out: the day, the week from Sunday, the month, the quarter widened to
 * whole weeks, or otherwise the year.
 */
function getTimelineDays(scale: TimelineScale, anchor: Date): Period {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  const day = startOfDay(anchor);

  if (scale === TimelineScale.DAY) {
    return { end: shiftDays(day, 1), start: day };
  }

  if (scale === TimelineScale.WEEK) {
    const sunday = shiftDays(day, -day.getUTCDay());

    return { end: shiftDays(sunday, WEEK_DAYS), start: sunday };
  }

  if (scale === TimelineScale.MONTH) {
    return {
      end: new Date(Date.UTC(year, month + 1, 1)),
      start: new Date(Date.UTC(year, month, 1)),
    };
  }

  if (scale === TimelineScale.QUARTER) {
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
 * The days a view other than the timeline shows, from UTC midnight to UTC
 * midnight.
 */
function getVisibleDays(
  calendarWindow: Exclude<CalendarWindow, CalendarWindow.TIMELINE>,
  anchor: Date,
  agendaDays: null | number | undefined,
): Period {
  const day = startOfDay(anchor);

  if (calendarWindow === CalendarWindow.MONTH) {
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

  if (calendarWindow === CalendarWindow.WEEK) {
    // Weeks start on Sunday, as the calendar draws them.
    const sunday = shiftDays(day, -day.getUTCDay());

    return { end: shiftDays(sunday, WEEK_DAYS), start: sunday };
  }

  const length = {
    [CalendarWindow.AGENDA]: Math.min(
      Math.max(agendaDays ?? AGENDA_DAY_COUNT, 1),
      MAXIMUM_AGENDA_DAYS,
    ),
    [CalendarWindow.DAY]: 1,
    [CalendarWindow.THREE_DAY]: THREE_DAYS,
  }[calendarWindow];

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

/**
 * The UTC midnight that starts the day an instant falls on.
 */
function startOfDay(anchor: Date): Date {
  return new Date(
    Date.UTC(
      anchor.getUTCFullYear(),
      anchor.getUTCMonth(),
      anchor.getUTCDate(),
    ),
  );
}
