import {
  getDayListing,
  getDayRange,
} from "../../calendar-display/calendar-table/calendar-table.utilities";
import { compareNatural } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-group-order.utilities";
import { getEventRowHeight } from "../calendar-event-row/calendar-event-row.utilities";

import type { CalendarEventRecord } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Names a row by its event.
 */
export function getEventRowKey(row: { record: CalendarEventRecord }): string {
  return row.record.id;
}

/**
 * Every row of the list is one event's, as tall as its tags need.
 */
export function getRowHeight(
  row: Readonly<{ record: CalendarEventRecord }>,
  width: number,
): number {
  return getEventRowHeight(row.record.tags, width);
}

/**
 * The day's events by start then name, each once; one begun earlier is marked ongoing.
 */
export function listDayEvents(
  events: readonly CalendarEventRecord[],
  day: string,
  timeZone: string,
): { ongoing: boolean; record: CalendarEventRecord }[] {
  const range = getDayRange(day, timeZone, 1);
  const rows: { ongoing: boolean; record: CalendarEventRecord }[] = [];

  for (const record of events.toSorted(compareStarts)) {
    const listing = getDayListing(record, range);

    if (listing !== null) {
      rows.push({ ongoing: listing.ongoing, record });
    }
  }

  return rows;
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
    compareNatural(left.summary, right.summary)
  );
}
