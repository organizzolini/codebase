import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";

/**
 * The events with each of the extra ones the sweep did not already detect, so
 * a boundary found on the window's edge counts once.
 */
export function withEdgeEvents(
  events: readonly DetectedCalendarEvent[],
  extra: readonly DetectedCalendarEvent[],
): DetectedCalendarEvent[] {
  const known = new Set(events.map((event) => eventKey(event)));

  return [
    ...events,
    ...extra.filter((event) => {
      const key = eventKey(event);
      const isNew = !known.has(key);
      known.add(key);
      return isNew;
    }),
  ];
}

/** An event's identity: its minute and its tags, in any order. */
function eventKey(event: DetectedCalendarEvent): string {
  return [event.start.valueOf(), ...event.tags.toSorted()].join("\u001F");
}
