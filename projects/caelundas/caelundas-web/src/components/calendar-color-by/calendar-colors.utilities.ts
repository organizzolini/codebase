import { EVENT_COLOR_RULES } from "./calendar-colors.constants";

import type { CalendarEventRecord } from "../events-calendar/calendar-records.types";
import type { EventColorRule } from "./calendar-colors.types";

// 🌎 Public Functions

/**
 * Draws each event in the color `colorOf` gives it, or in none when colors are off so views use their default.
 */
export function colorEvents(
  events: readonly CalendarEventRecord[],
  enabled: boolean,
  colorOf: (event: CalendarEventRecord) => null | string = getEventColor,
): CalendarEventRecord[] {
  const colored: CalendarEventRecord[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const event of events) {
    colored.push({ ...event, color: enabled ? colorOf(event) : null });
  }

  return colored;
}

/**
 * The color of an event's kind: that of its kind's rule, or its own color
 * from the data when it has none.
 */
export function getEventColor(event: CalendarEventRecord): null | string {
  return getEventKind(event)?.color ?? event.color;
}

/**
 * The kind of an event: the most specific rule any of its tags falls under,
 * or none when no rule does.
 */
export function getEventKind(
  event: CalendarEventRecord,
): EventColorRule | null {
  let kind: EventColorRule | null = null;

  for (const tag of event.tags) {
    for (const rule of EVENT_COLOR_RULES) {
      if (
        rule.path.length > (kind?.path.length ?? -1) &&
        (tag.path === rule.path || tag.path.startsWith(`${rule.path} / `))
      ) {
        kind = rule;
      }
    }
  }

  return kind;
}
