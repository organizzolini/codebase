import { describe, expect, it } from "vitest";

import { getAgendaRange, toAgendaRows } from "./calendar-agenda";

import type { CalendarEventRecord } from "../events-database/events-database.types";

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
});
