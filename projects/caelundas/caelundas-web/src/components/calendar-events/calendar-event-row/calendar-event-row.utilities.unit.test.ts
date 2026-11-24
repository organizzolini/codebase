import { describe, expect, it } from "vitest";

import { EVENT_ROW_MINIMUM_HEIGHT } from "./calendar-event-row.constants";
import { getEventRowHeight } from "./calendar-event-row.utilities";

import type { CalendarEventTag } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

describe(getEventRowHeight, () => {
  const tags: CalendarEventTag[] = Array.from({ length: 8 }, (_, index) => ({
    depth: 1,
    id: String(index),
    name: "Harmonic 4",
    path: "Type / Harmonic 4",
  }));

  it("is the usual height for an event with no tags", () => {
    expect(getEventRowHeight([], 800)).toBe(EVENT_ROW_MINIMUM_HEIGHT);
  });

  it("adds a line for each line the tags wrap onto", () => {
    const wide = getEventRowHeight(tags, 1600);
    const narrow = getEventRowHeight(tags, 500);

    expect(wide).toBe(72);
    expect(narrow).toBeGreaterThan(wide);
  });
});
