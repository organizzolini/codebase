import { getEventRowHeight } from "../utilities/calendar-agenda.utilities";

import type { CalendarEventRecord } from "../types/events-database.types";

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
