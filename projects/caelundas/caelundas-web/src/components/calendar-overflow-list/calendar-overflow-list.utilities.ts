import { getEventRowHeight } from "../calendar-agenda/calendar-agenda.utilities";

import type { CalendarEventRecord } from "../events-calendar/events-database.types";

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
