import type { CalendarEventRecord } from "../events-database/events-database.types";
import type { CalendarEvent } from "@codebase/presentation";

const MINUTE_MILLISECONDS = 60_000;

/**
 * Maps a database event to the vendored calendar's event model, carrying the
 * record along as its data. An instant is given one minute, because the
 * calendar draws nothing for an event that ends where it starts. Events are
 * read-only: the app never edits them.
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
    title: record.summary,
  };
}
