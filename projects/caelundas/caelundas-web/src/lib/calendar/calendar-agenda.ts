import { AGENDA_DAY_COUNT } from "./calendar-views";
import { addCalendarDays, formatCalendarDate } from "./calendar-window";

import type { CalendarEventRecord } from "../events-database/events-database.types";

/**
 * How tall each kind of agenda row is drawn, in pixels, so the list can be
 * windowed without measuring a row.
 */
export const AGENDA_ROW_HEIGHTS: Readonly<Record<AgendaRow["kind"], number>> = {
  day: 36,
  event: 56,
};

/**
 * The days an agenda lists: `from` is included and `through` is not, both as
 * `YYYY-MM-DD` in `timeZone`.
 */
export interface AgendaRange {
  from: string;
  through: string;
  timeZone: string;
}

/**
 * One row of the agenda: a day's heading, or one event under it.
 */
export type AgendaRow =
  | {
      /**
       * The day as `YYYY-MM-DD` in the data's zone.
       */
      day: string;
      kind: "day";
    }
  | {
      kind: "event";
      /**
       * Whether the event began before the agenda's first day, under which
       * it is listed rather than under the day it began.
       */
      ongoing: boolean;
      record: CalendarEventRecord;
    };

/**
 * The agenda's range from the day it opens on.
 */
export function getAgendaRange(
  from: string,
  timeZone: string,
  dayCount = AGENDA_DAY_COUNT,
): AgendaRange {
  return { from, through: addCalendarDays(from, dayCount), timeZone };
}

/**
 * Lays events out as agenda rows, a heading for each day that has any and
 * the day's events beneath it in order. An event is listed once, on the day
 * it begins, however long it lasts; one already under way on the first day
 * is listed there, so a long span is neither repeated daily nor lost.
 */
export function toAgendaRows(
  events: readonly CalendarEventRecord[],
  range: AgendaRange,
): AgendaRow[] {
  const { from, through, timeZone } = range;
  const byDay = new Map<string, AgendaRow[]>();

  for (const record of events.toSorted(compareStarts)) {
    const startDay = formatCalendarDate(record.start, timeZone);
    // An end is not part of the event, so one ending at midnight does not
    // reach into the day that midnight begins.
    const ongoing =
      startDay < from &&
      formatCalendarDate(new Date(record.end.getTime() - 1), timeZone) >= from;
    const day = ongoing ? from : startDay;

    if (day >= from && day < through) {
      const rows = byDay.get(day) ?? [];

      rows.push({ kind: "event", ongoing, record });
      byDay.set(day, rows);
    }
  }

  return [...byDay.entries()]
    .toSorted(([left], [right]) => left.localeCompare(right))
    .flatMap(([day, rows]) => [{ day, kind: "day" as const }, ...rows]);
}

/**
 * Orders events by when they begin, then by name.
 */
function compareStarts(
  left: CalendarEventRecord,
  right: CalendarEventRecord,
): number {
  return (
    left.start.getTime() - right.start.getTime() ||
    left.summary.localeCompare(right.summary)
  );
}
