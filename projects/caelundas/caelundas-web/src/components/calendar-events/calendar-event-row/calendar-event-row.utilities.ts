import {
  EVENT_ROW_BASE_HEIGHT,
  EVENT_ROW_CHROME_WIDTH,
  EVENT_ROW_MINIMUM_HEIGHT,
  PILL_CHARACTER_WIDTH,
  PILL_CHROME_WIDTH,
  PILL_GAP,
  PILL_LINE_HEIGHT,
} from "./calendar-event-row.constants";

import type { CalendarEventTag } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Height of an event row `width` pixels wide: its name and duration, plus a line per wrapped tag line.
 */
export function getEventRowHeight(
  tags: readonly CalendarEventTag[],
  width: number,
): number {
  const available = width - EVENT_ROW_CHROME_WIDTH;
  let lines = 0;
  let used = 0;

  for (const tag of tags) {
    const pill = tag.name.length * PILL_CHARACTER_WIDTH + PILL_CHROME_WIDTH;

    if (lines === 0 || used + PILL_GAP + pill > available) {
      lines += 1;
      used = pill;
    } else {
      used += PILL_GAP + pill;
    }
  }

  return Math.max(
    EVENT_ROW_MINIMUM_HEIGHT,
    EVENT_ROW_BASE_HEIGHT + lines * PILL_LINE_HEIGHT,
  );
}
