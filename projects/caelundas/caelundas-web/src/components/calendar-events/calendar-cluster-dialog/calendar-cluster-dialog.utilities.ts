import { getEventRowHeight } from "../calendar-event-row/calendar-event-row.utilities";

import type { CalendarEventRecord } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Names a row by its event.
 */
export function getEventRowKey(record: CalendarEventRecord): string {
  return record.id;
}

/**
 * Every row of the list is one event's, as tall as its tags need.
 */
export function getRowHeight(
  record: CalendarEventRecord,
  width: number,
): number {
  return getEventRowHeight(record.tags, width);
}
