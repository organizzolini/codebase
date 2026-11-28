import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCalendarClusters } from "./use-calendar-clusters";

import type { CalendarEventRecord } from "../../../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.types";

function event(
  id: string,
  start: Date,
  end: Date = start,
): CalendarEventRecord {
  return {
    color: null,
    durationMinutes: Math.round((end.getTime() - start.getTime()) / 60_000),
    end,
    groups: [],
    id,
    name: id,
    note: id,
    start,
    tags: [],
    timezone: "UTC",
  };
}

const at = (id: string, minute: number): CalendarEventRecord =>
  event(id, new Date(Date.UTC(2026, 2, 4, 10, minute)));

// Three events within ten minutes of the first, on 4 March.
const EVENTS = [at("a", 0), at("b", 5), at("c", 10)];

function render(
  view: CalendarViewName,
  events: readonly CalendarEventRecord[] = EVENTS,
  overrides: { compact?: boolean } = {},
): ReturnType<
  typeof renderHook<ReturnType<typeof useCalendarClusters>, unknown>
> {
  return renderHook(() =>
    useCalendarClusters({
      anchor: new Date(Date.UTC(2026, 2, 4)),
      events,
      grouping: [],
      timeZone: "UTC",
      view,
      ...overrides,
    }),
  );
}

function shown(
  view: CalendarViewName,
  overrides: { compact?: boolean } = {},
): string[] {
  return render(view, EVENTS, overrides).result.current.events.map(
    (merged) => merged.id,
  );
}

describe(useCalendarClusters, () => {
  it("returns its result", () => {
    const { result } = renderHook(() =>
      useCalendarClusters({
        anchor: new Date(Date.UTC(2026, 2, 4)),
        events: [],
        grouping: [],
        timeZone: "UTC",
        view: "week",
      }),
    );

    expect(result.current).toStrictEqual({
      calendarEvents: [],
      events: [],
      expanded: new Set(),
      groups: new Map(),
      handleEventClick: expect.any(Function),
      members: new Map(),
      origins: new Map(),
    });
  });

  it("merges close events in a week, where the columns are narrow", () => {
    expect(shown("week")).toStrictEqual(["cluster:a"]);
  });

  it("merges them only when more of them crowd a day, which has room", () => {
    expect(shown("day")).toStrictEqual(["a", "b", "c"]);
  });

  it("merges on a phone as a week does, in any view", () => {
    expect(shown("day", { compact: true })).toStrictEqual(["cluster:a"]);
  });

  it("merges nothing in a view that has its own overflow", () => {
    expect(shown("month")).toStrictEqual(["a", "b", "c"]);
  });

  it("opens a cluster that is clicked beside its events, and closes it", () => {
    const { result } = render("week");

    act(() => {
      result.current.handleEventClick({ eventId: "cluster:a" } as never);
    });

    expect(result.current.expanded.has("cluster:a")).toBe(true);
    expect(result.current.events.map((merged) => merged.id)).toStrictEqual([
      "cluster:a",
      "a",
      "b",
      "c",
    ]);

    act(() => {
      result.current.handleEventClick({ eventId: "a" } as never);
    });

    expect(result.current.expanded.size).toBe(1);

    act(() => {
      result.current.handleEventClick({ eventId: "cluster:a" } as never);
    });

    expect(result.current.expanded.size).toBe(0);
    expect(result.current.events.map((merged) => merged.id)).toStrictEqual([
      "cluster:a",
    ]);
  });

  it("marks where a long event starts and ends on its days in a week", () => {
    const long = event(
      "long",
      new Date(Date.UTC(2026, 2, 3, 8)),
      new Date(Date.UTC(2026, 2, 6, 20)),
    );
    const { result } = render("week", [long]);

    expect(result.current.events.map((merged) => merged.id)).toStrictEqual([
      "long",
      "edge:start:long",
      "edge:end:long",
    ]);
    expect(result.current.origins.get("edge:end:long")).toBe(long);
  });

  it("marks no edges in a view that has no hours", () => {
    const long = event(
      "long",
      new Date(Date.UTC(2026, 2, 3, 8)),
      new Date(Date.UTC(2026, 2, 6, 20)),
    );
    const { result } = render("month", [long]);

    expect(result.current.events).toStrictEqual([long]);
  });
});
