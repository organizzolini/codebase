import { CalendarView } from "./calendar-view.entities";
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
} from "./calendar-windows.constants";
import { TimelineScale } from "./timeline-scale.entities";

import type {
  CalendarWindowOptions,
  CalendarWindows,
  TimeWindow,
} from "./calendar-windows.types";

/**
 * The days a view shows, widened a day for zone midnights. With no view, it
 * covers month and agenda so resizing needs no reload.
 */
export function getCalendarWindows(
  view: CalendarView | null | undefined,
  anchor: Date,
  options: CalendarWindowOptions = {},
): CalendarWindows {
  if (view === undefined || view === null) {
    const month = getCalendarWindows(CalendarView.MONTH, anchor);
    const agenda = getCalendarWindows(CalendarView.AGENDA, anchor, options);

    return {
      columnMinutes: null,
      visible: joinWindows(month.visible, agenda.visible),
      window: joinWindows(month.window, agenda.window),
    };
  }

  const scale = options.scale ?? DEFAULT_TIMELINE_SCALE;
  const visible =
    view === CalendarView.TIMELINE
      ? getTimelineDays(scale, anchor)
      : getVisibleDays(view, anchor, options.agendaDays);

  return {
    columnMinutes:
      view === CalendarView.TIMELINE ? COLUMN_MINUTES[scale] : null,
    visible,
    window: {
      end: shiftDays(visible.end, BUFFER_DAYS),
      start: shiftDays(visible.start, -BUFFER_DAYS),
    },
  };
}

/**
 * The timeline axis's span at a scale: the day, the week from Sunday, the
 * month, the quarter in whole weeks, or the year.
 */
function getTimelineDays(scale: TimelineScale, anchor: Date): TimeWindow {
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
  view: Exclude<CalendarView, CalendarView.TIMELINE>,
  anchor: Date,
  agendaDays: null | number | undefined,
): TimeWindow {
  const day = startOfDay(anchor);

  if (view === CalendarView.MONTH) {
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

  if (view === CalendarView.WEEK) {
    // Weeks start on Sunday, as the calendar draws them.
    const sunday = shiftDays(day, -day.getUTCDay());

    return { end: shiftDays(sunday, WEEK_DAYS), start: sunday };
  }

  const length = {
    [CalendarView.AGENDA]: Math.min(
      Math.max(agendaDays ?? AGENDA_DAY_COUNT, 1),
      MAXIMUM_AGENDA_DAYS,
    ),
    [CalendarView.DAY]: 1,
    [CalendarView.THREE_DAY]: THREE_DAYS,
  }[view];

  return { end: shiftDays(day, length), start: day };
}

/**
 * The smallest window holding two.
 */
function joinWindows(left: TimeWindow, right: TimeWindow): TimeWindow {
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
