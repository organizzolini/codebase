import { describe, expect, it } from "vitest";

import { describeBar } from "./use-bar-dialog.utilities";

import type { CalendarEventRecord } from "../../types/events-database.types";

function record(id: string): CalendarEventRecord {
  return {
    color: null,
    description: "Mars enters Aries",
    durationMinutes: 0,
    end: new Date(Date.UTC(2026, 2, 4)),
    groups: [],
    id,
    location: null,
    start: new Date(Date.UTC(2026, 2, 4)),
    summary: "♂️ → ♈ Mars enters Aries",
    tags: [],
    timezone: "UTC",
  };
}

describe(describeBar, () => {
  it("opens nothing for a marker without events", () => {
    expect(describeBar(undefined)).toBeUndefined();
    expect(describeBar({ names: [], records: [] })).toBeUndefined();
  });

  it("titles one event by its name", () => {
    expect(
      describeBar({ names: ["Mars enters Aries"], records: [record("a")] })
        ?.title,
    ).toBe("Mars enters Aries");
  });

  it("titles several events by their count", () => {
    expect(
      describeBar({ names: [], records: [record("a"), record("b")] })?.title,
    ).toBe("2 events");
  });
});
