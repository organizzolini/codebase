import { getEventRowHeight } from "../utilities/calendar-agenda.utilities";

import type { CalendarEventRecord } from "../types/events-database.types";

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
