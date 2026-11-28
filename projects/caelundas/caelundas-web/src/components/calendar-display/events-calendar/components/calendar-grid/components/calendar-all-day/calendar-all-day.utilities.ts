import { NEXT_ALL_DAY_MODE } from "./calendar-all-day.constants";

import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";
import type { AllDayMode } from "./calendar-all-day.types";
import type { EventCalendarSegment } from "@codebase/presentation";

// 🌎 Public Functions

/**
 * The events that run through each day of the section, by the day's start, each once and in order of start.
 */
export function getAllDayRecords(
  segments: readonly EventCalendarSegment<CalendarEventRecord>[],
): Map<number, CalendarEventRecord[]> {
  const byDay = new Map<number, CalendarEventRecord[]>();

  for (const segment of segments) {
    const record = segment.occurrence.event.data;

    if (record !== undefined) {
      const day = segment.day.getTime();

      byDay.set(day, [...(byDay.get(day) ?? []), record]);
    }
  }

  for (const [day, records] of byDay) {
    byDay.set(
      day,
      records.toSorted(
        (left, right) => left.start.getTime() - right.start.getTime(),
      ),
    );
  }

  return byDay;
}

/**
 * The state after this one, wrapping from every event back to the slim row.
 */
export function getNextAllDayMode(mode: AllDayMode): AllDayMode {
  return NEXT_ALL_DAY_MODE[mode];
}

/**
 * Reads a link value as a state: `c` and `e` name the ends, anything else the groups.
 */
export function parseAllDayMode(value: unknown): AllDayMode | undefined {
  if (value === "c") {
    return "contracted";
  }

  return value === "e" ? "expanded" : undefined;
}

/**
 * Writes a state as the link's value: the groups are the default, so none.
 */
export function toAllDaySearch(mode: AllDayMode): "c" | "e" | undefined {
  if (mode === "contracted") {
    return "c";
  }

  return mode === "expanded" ? "e" : undefined;
}
