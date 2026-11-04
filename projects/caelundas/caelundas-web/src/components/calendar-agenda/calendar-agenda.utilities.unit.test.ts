import { describe, expect, it } from "vitest";

import { AGENDA_ROW_HEIGHTS } from "./calendar-agenda.constants";
import {
  getAgendaRange,
  getEventRowHeight,
  toAgendaRows,
} from "./calendar-agenda.utilities";

import type {
  CalendarEventRecord,
  CalendarEventTag,
} from "../events-calendar/events-database.types";

function event(id: string, summary: string): CalendarEventRecord {
  const at = new Date("2026-03-04T10:00:00.000Z");

  return {
    color: null,
    description: "",
    durationMinutes: 0,
    end: at,
    groups: [],
    id,
    location: null,
    start: at,
    summary,
    tags: [],
    timezone: "UTC",
  };
}

describe(toAgendaRows, () => {
  it("orders events that begin together by name", () => {
    const rows = toAgendaRows(
      [event("b", "Venus"), event("a", "Mars")],
      getAgendaRange("2026-03-01", "UTC"),
    );

    expect(
      rows.flatMap((row) => (row.kind === "event" ? [row.record.id] : [])),
    ).toStrictEqual(["a", "b"]);
  });

  describe(getEventRowHeight, () => {
    const tags: CalendarEventTag[] = Array.from({ length: 8 }, (_, index) => ({
      depth: 1,
      id: String(index),
      name: "Harmonic 4",
      path: "Type / Harmonic 4",
    }));

    it("is the usual height for an event with no tags", () => {
      expect(getEventRowHeight([], 800)).toBe(AGENDA_ROW_HEIGHTS.event);
    });

    it("adds a line for each line the tags wrap onto", () => {
      const wide = getEventRowHeight(tags, 1600);
      const narrow = getEventRowHeight(tags, 500);

      expect(wide).toBe(72);
      expect(narrow).toBeGreaterThan(wide);
    });
  });
});
