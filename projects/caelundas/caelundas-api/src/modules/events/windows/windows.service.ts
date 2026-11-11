import { Injectable } from "@nestjs/common";

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
 * Works out the days a calendar window shows and the period of events to
 * read for them.
 */
@Injectable()
export class WindowsService {
  /**
   * The timeline axis span at a scale, with quarters widened to whole weeks.
   */
  private getTimelineDays(scale: TimelineScale, anchor: Date): Period {
    const year = anchor.getUTCFullYear();
    const month = anchor.getUTCMonth();
    const day = this.startOfDay(anchor);

    if (scale === TimelineScale.DAY) {
      return { end: this.shiftDays(day, 1), start: day };
    }

    if (scale === TimelineScale.WEEK) {
      const sunday = this.shiftDays(day, -day.getUTCDay());

      return { end: this.shiftDays(sunday, WEEK_DAYS), start: sunday };
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
        end: this.shiftDays(next, (WEEK_DAYS - next.getUTCDay()) % WEEK_DAYS),
        start: this.shiftDays(first, -first.getUTCDay()),
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
  private getVisibleDays(
    calendarWindow: Exclude<CalendarWindow, CalendarWindow.TIMELINE>,
    anchor: Date,
    agendaDays: null | number | undefined,
  ): Period {
    const day = this.startOfDay(anchor);

    if (calendarWindow === CalendarWindow.MONTH) {
      const first = new Date(
        Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
      );
      const next = new Date(
        Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 1),
      );

      return {
        end: this.shiftDays(next, MONTH_TRAILING_DAYS),
        start: this.shiftDays(first, -MONTH_LEADING_DAYS),
      };
    }

    if (calendarWindow === CalendarWindow.WEEK) {
      // Weeks start on Sunday, as the calendar draws them.
      const sunday = this.shiftDays(day, -day.getUTCDay());

      return { end: this.shiftDays(sunday, WEEK_DAYS), start: sunday };
    }

    const length = {
      [CalendarWindow.AGENDA]: Math.min(
        Math.max(agendaDays ?? AGENDA_DAY_COUNT, 1),
        MAXIMUM_AGENDA_DAYS,
      ),
      [CalendarWindow.DAY]: 1,
      [CalendarWindow.THREE_DAY]: THREE_DAYS,
    }[calendarWindow];

    return { end: this.shiftDays(day, length), start: day };
  }

  /**
   * The smallest period holding two.
   */
  private joinPeriods(left: Period, right: Period): Period {
    return {
      end: new Date(Math.max(left.end.getTime(), right.end.getTime())),
      start: new Date(Math.min(left.start.getTime(), right.start.getTime())),
    };
  }

  /**
   * An instant a number of whole days later, or earlier for a negative one.
   */
  private shiftDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * DAY_MILLISECONDS);
  }

  /**
   * The UTC midnight that starts the day an instant falls on.
   */
  private startOfDay(anchor: Date): Date {
    return new Date(
      Date.UTC(
        anchor.getUTCFullYear(),
        anchor.getUTCMonth(),
        anchor.getUTCDate(),
      ),
    );
  }

  /**
   * The days a view shows, and the period read for them, with a day's buffer
   * either side.
   */
  public getWindows(
    calendarWindow: CalendarWindow | null | undefined,
    anchor: Date,
    options: WindowsOptions = {},
  ): Windows {
    if (calendarWindow === undefined || calendarWindow === null) {
      const month = this.getWindows(CalendarWindow.MONTH, anchor);
      const agenda = this.getWindows(CalendarWindow.AGENDA, anchor, options);

      return {
        columnMinutes: null,
        read: this.joinPeriods(month.read, agenda.read),
        visible: this.joinPeriods(month.visible, agenda.visible),
      };
    }

    const scale = options.scale ?? DEFAULT_TIMELINE_SCALE;
    const visible =
      calendarWindow === CalendarWindow.TIMELINE
        ? this.getTimelineDays(scale, anchor)
        : this.getVisibleDays(calendarWindow, anchor, options.agendaDays);

    return {
      columnMinutes:
        calendarWindow === CalendarWindow.TIMELINE
          ? COLUMN_MINUTES[scale]
          : null,
      read: {
        end: this.shiftDays(visible.end, BUFFER_DAYS),
        start: this.shiftDays(visible.start, -BUFFER_DAYS),
      },
      visible,
    };
  }
}
