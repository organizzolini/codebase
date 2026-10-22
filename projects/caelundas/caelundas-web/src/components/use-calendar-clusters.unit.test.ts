import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCalendarClusters } from "./use-calendar-clusters";

import type { CalendarViewName } from "../lib/calendar/calendar-views";
import type { CalendarEventRecord } from "../lib/events-database/events-database.types";

const SQUARE = "Type / Aspect / Simple Aspect / Major Aspect / Square";

function event(id: string, minute: number, path = SQUARE): CalendarEventRecord {
  const at = new Date(Date.UTC(2026, 2, 4, 10, minute));

  return {
    color: null,
    description: id,
    durationMinutes: 0,
    end: at,
    groups: [],
    id,
    location: null,
    start: at,
    summary: id,
    tags: [{ depth: 4, id: `tag-${id}`, name: "Square", path }],
    timezone: "UTC",
  };
}

// Three aspects within ten minutes of the first, on 4 March.
const EVENTS = [event("a", 0), event("b", 5), event("c", 10)];

function shown(
  view: CalendarViewName,
  overrides: { compact?: boolean; enabled?: boolean } = {},
): string[] {
  const { result } = renderHook(() =>
    useCalendarClusters({
      anchor: new Date(Date.UTC(2026, 2, 4)),
      enabled: true,
      events: EVENTS,
      timeZone: "UTC",
      view,
      ...overrides,
    }),
  );

  return result.current.events.map((merged) => merged.id);
}

describe(useCalendarClusters, () => {
  it("merges close events in a week, where the columns are narrow", () => {
    expect(shown("week")).toStrictEqual(["cluster:a"]);
  });

  it("merges them only when more of them crowd a day, which has room", () => {
    expect(shown("day")).toStrictEqual(["a", "b", "c"]);
  });

  it("merges in three days a run of three, which a week would also merge", () => {
    expect(shown("three-day")).toStrictEqual(["cluster:a"]);
  });

  it("merges on a phone as a week does, in any view", () => {
    expect(shown("day", { compact: true })).toStrictEqual(["cluster:a"]);
  });

  it("merges nothing when merging is off or the view has its own overflow", () => {
    expect(shown("week", { enabled: false })).toStrictEqual(["a", "b", "c"]);
    expect(shown("month")).toStrictEqual(["a", "b", "c"]);
  });
});
