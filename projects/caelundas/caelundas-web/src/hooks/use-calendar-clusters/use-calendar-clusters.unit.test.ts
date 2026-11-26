import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCalendarClusters } from "./use-calendar-clusters";

import type { CalendarEventRecord } from "../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.types";

const SQUARE = "Aspect / Simple / Major / Square";

function event(id: string, minute: number, path = SQUARE): CalendarEventRecord {
  const at = new Date(Date.UTC(2026, 2, 4, 10, minute));

  return {
    color: null,
    durationMinutes: 0,
    end: at,
    groups: [],
    id,
    name: id,
    note: id,
    start: at,
    tags: [{ depth: 4, id: `tag-${id}`, name: "Square", path }],
    timezone: "UTC",
  };
}

// Three aspects within ten minutes of the first, on 4 March.
const EVENTS = [event("a", 0), event("b", 5), event("c", 10)];

function shown(
  view: CalendarViewName,
  overrides: { compact?: boolean } = {},
): string[] {
  const { result } = renderHook(() =>
    useCalendarClusters({
      anchor: new Date(Date.UTC(2026, 2, 4)),
      events: EVENTS,
      timeZone: "UTC",
      view,
      ...overrides,
    }),
  );

  return result.current.events.map((merged) => merged.id);
}

describe(useCalendarClusters, () => {
  it("returns its result", () => {
    const { result } = renderHook(() =>
      useCalendarClusters({
        anchor: new Date(Date.UTC(2026, 2, 4)),
        events: [],
        timeZone: "UTC",
        view: "week",
      }),
    );

    expect(result.current).toStrictEqual({
      dialog: expect.anything(),
      events: [],
      handleEventClick: expect.any(Function),
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

  it("opens the events behind a cluster that is clicked, and closes them", () => {
    const { result } = renderHook(() =>
      useCalendarClusters({
        anchor: new Date(Date.UTC(2026, 2, 4)),
        events: EVENTS,
        timeZone: "UTC",
        view: "week",
      }),
    );

    act(() => {
      result.current.handleEventClick({ eventId: "cluster:a" } as never);
    });

    expect(result.current.dialog).toBeDefined();

    act(() => {
      result.current.handleEventClick({ eventId: "a" } as never);
    });

    expect(result.current.dialog).toBeDefined();
  });
});
