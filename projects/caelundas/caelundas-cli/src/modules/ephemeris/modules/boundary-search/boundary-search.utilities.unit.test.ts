import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import { withEdgeEvents } from "./boundary-search.utilities";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";

const at = (minute: number, tags: string[]): DetectedCalendarEvent => {
  const start = moment.utc("2026-01-01T00:00:00Z").add(minute, "minutes");
  return { description: "d", end: start, start, summary: "s", tags };
};

describe(withEdgeEvents, () => {
  it("adds an edge event the sweep did not detect", () => {
    const edge = at(-5, ["A"]);

    expect(withEdgeEvents([at(1, ["A"])], [edge])).toContain(edge);
  });

  it("skips an edge event the sweep detected, whatever order its tags came in", () => {
    const events = [at(0, ["A", "B"])];

    expect(withEdgeEvents(events, [at(0, ["B", "A"])])).toHaveLength(1);
  });

  it("counts a repeated edge event once", () => {
    expect(withEdgeEvents([], [at(3, ["A"]), at(3, ["A"])])).toHaveLength(1);
  });
});
