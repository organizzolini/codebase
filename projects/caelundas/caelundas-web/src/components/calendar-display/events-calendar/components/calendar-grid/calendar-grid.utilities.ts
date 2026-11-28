import { toCalendarEvent } from "../calendar-loader/calendar-events.utilities";

import { NO_EVENTS } from "./calendar-grid.constants";

import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";
import type { CalendarEvent } from "@codebase/presentation";

// 🌎 Public Functions

/**
 * The events the event calendar draws: none for the month, and for a block its long event.
 */
export function toCalendarEvents(
  events: readonly CalendarEventRecord[],
  context: Readonly<{
    isMonth: boolean;
    origins: ReadonlyMap<string, CalendarEventRecord>;
  }>,
): CalendarEvent<CalendarEventRecord>[] {
  if (context.isMonth) {
    return NO_EVENTS;
  }

  const calendarEvents: CalendarEvent<CalendarEventRecord>[] = [];

  for (const event of events) {
    const origin = context.origins.get(event.id);
    const mapped = toCalendarEvent(event);

    calendarEvents.push(
      origin === undefined ? mapped : { ...mapped, data: origin },
    );
  }

  return calendarEvents;
}
