import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCalendarGridRenderers } from "./use-calendar-grid-renderers";

import type { DayOpener } from "../../components/calendar-display/events-calendar/components/calendar-month/calendar-month.types";

const CLUSTERED = {
  calendarEvents: [],
  events: [],
  expanded: new Set<string>(),
  groups: new Map(),
  handleEventClick: () => {},
  members: new Map(),
  origins: new Map(),
};

function render(
  onOpenDay?: DayOpener,
): ReturnType<typeof useCalendarGridRenderers> {
  return renderHook(() =>
    useCalendarGridRenderers({
      allDayMode: "grouped",
      clustered: CLUSTERED,
      events: [],
      groupColors: undefined,
      grouping: [],
      onAllDayModeChange: undefined,
      onOpenDay,
      timeZone: "UTC",
    }),
  ).result.current;
}

describe(useCalendarGridRenderers, () => {
  it("returns its result", () => {
    const { result } = renderHook(() =>
      useCalendarGridRenderers({
        allDayMode: "grouped",
        clustered: CLUSTERED,
        events: [],
        groupColors: undefined,
        grouping: [],
        onAllDayModeChange: undefined,
        onOpenDay: undefined,
        timeZone: "UTC",
      }),
    );

    expect(result.current).toStrictEqual({
      renderAllDaySection: expect.any(Function),
      renderDayHeader: expect.any(Function),
      renderEvent: expect.any(Function),
      renderMoreContent: expect.any(Function),
    });
  });

  it("draws a week's day heading as a button, and no other heading", () => {
    const onOpenDay = vi.fn<DayOpener>();
    const { renderDayHeader } = render(onOpenDay);
    const day = new Date("2026-03-04T00:00:00Z");

    expect(renderDayHeader({ day, view: "week" })).toBeDefined();
    expect(renderDayHeader({ day, view: "day" })).toBeDefined();
    expect(renderDayHeader({ day, view: "month" })).toBeUndefined();
    expect(render().renderDayHeader({ day, view: "week" })).toBeUndefined();
  });

  it("draws an event with no data as its title", () => {
    expect(
      render().renderEvent({
        occurrence: { event: { title: "Title" }, eventId: "a" },
      } as never),
    ).toBe("Title");
  });

  it("draws the whole day for a busy day's +N more, and an all-day row", () => {
    const renderers = render();

    expect(
      renderers.renderMoreContent({ day: new Date("2026-03-04T00:00:00Z") }),
    ).toBeDefined();
    expect(
      renderers.renderAllDaySection({ days: [], segments: [] }),
    ).toBeDefined();
  });
});
