import {
  addCalendarDays,
  formatCalendarDate,
} from "../calendar-window/calendar-window.utilities";

import { DAYS_PER_WEEK } from "./calendar-month.constants";

import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";
import type { MonthGrid, MonthIndex } from "./calendar-month.types";

// 🌎 Public Functions

/**
 * The weeks a month draws: from the Sunday on or before its first day to the Saturday on or after its last.
 */
export function getMonthGrid(anchor: Date): MonthGrid {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  const firstDay = first.toISOString().slice(0, 10);
  const lastDay = last.toISOString().slice(0, 10);
  const weeks: string[][] = [];
  let sunday = addCalendarDays(firstDay, -first.getUTCDay());

  while (sunday <= lastDay) {
    const week: string[] = [];

    for (let offset = 0; offset < DAYS_PER_WEEK; offset += 1) {
      week.push(addCalendarDays(sunday, offset));
    }

    weeks.push(week);
    sunday = addCalendarDays(sunday, DAYS_PER_WEEK);
  }

  return { firstDay, lastDay, weeks };
}

/**
 * Files each event under the grid days it runs through, setting apart those that run through the whole month.
 */
export function indexMonthEvents(
  events: readonly CalendarEventRecord[],
  grid: MonthGrid,
  timeZone: string,
): MonthIndex {
  const drawn = {
    from: grid.weeks[0]?.[0] ?? grid.firstDay,
    through: grid.weeks.at(-1)?.at(-1) ?? grid.lastDay,
  };
  const byDay = new Map<string, CalendarEventRecord[]>();
  const allMonth: CalendarEventRecord[] = [];

  for (const event of events) {
    const days = getEventDays(event, timeZone);

    if (days.from <= grid.firstDay && days.through >= grid.lastDay) {
      allMonth.push(event);
    } else {
      fileEvent(byDay, event, clampDays(days, drawn));
    }
  }

  return { allMonth, byDay };
}

/**
 * The days within another span, as `YYYY-MM-DD`; a span outside it is none.
 */
function clampDays(
  days: Readonly<{ from: string; through: string }>,
  within: Readonly<{ from: string; through: string }>,
): { from: string; through: string } {
  return {
    from: days.from.localeCompare(within.from) < 0 ? within.from : days.from,
    through:
      days.through.localeCompare(within.through) > 0
        ? within.through
        : days.through,
  };
}

/**
 * Files an event under each day from one to another, both included.
 */
function fileEvent(
  byDay: Map<string, CalendarEventRecord[]>,
  event: CalendarEventRecord,
  days: Readonly<{ from: string; through: string }>,
): void {
  for (
    let day = days.from;
    day <= days.through;
    day = addCalendarDays(day, 1)
  ) {
    const listed = byDay.get(day);

    if (listed === undefined) {
      byDay.set(day, [event]);
    } else {
      listed.push(event);
    }
  }
}

/**
 * The first and last day an event runs through; an end at midnight does not reach into the day it begins.
 */
function getEventDays(
  event: CalendarEventRecord,
  timeZone: string,
): { from: string; through: string } {
  return {
    from: formatCalendarDate(event.start, timeZone),
    through: formatCalendarDate(
      new Date(Math.max(event.start.getTime(), event.end.getTime() - 1)),
      timeZone,
    ),
  };
}
