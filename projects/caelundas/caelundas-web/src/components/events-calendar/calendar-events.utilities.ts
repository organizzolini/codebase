import { getEventLabel } from "../event-glyphs/calendar-glyphs.utilities";

import { MINUTE_MILLISECONDS } from "./calendar-events.constants";

import type { CalendarEventRecord } from "./calendar-records.types";
import type { CalendarEvent } from "@codebase/presentation";

/**
 * Maps a database event to the calendar's model, giving an instant one minute, since zero-length events draw nothing.
 */
export function toCalendarEvent(
  record: CalendarEventRecord,
): CalendarEvent<CalendarEventRecord> {
  const end =
    record.durationMinutes === 0
      ? new Date(record.start.getTime() + MINUTE_MILLISECONDS)
      : record.end;

  return {
    ...(record.color === null ? {} : { color: record.color }),
    data: record,
    end,
    id: record.id,
    readOnly: true,
    start: record.start,
    title: getEventLabel(record).glyphs,
  };
}
