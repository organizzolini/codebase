import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCalendarNavigation } from "./use-calendar-navigation";

import type { CalendarNavigation } from "../../components/calendar-navigation-group/calendar-navigation-group.types";

function renderNavigation(anchor: Date): {
  result: { current: ReturnType<typeof useCalendarNavigation> };
} {
  return renderHook(() =>
    useCalendarNavigation({ anchor, timeZone: "UTC", view: "week" }),
  );
}

describe(useCalendarNavigation, () => {
  it("returns its result", () => {
    const { result } = renderHook(() =>
      useCalendarNavigation({
        anchor: new Date(),
        timeZone: "UTC",
        view: "week",
      }),
    );

    expect(result.current.navigation.title).toBe("");
    expect(result.current.navigation.isToday).toBe(true);
    expect(result.current).toStrictEqual({
      handleNavigationChange: expect.any(Function),
      navigation: expect.objectContaining({ title: "" }),
    });
  });

  it("says today is not shown when the view is anchored elsewhere", () => {
    const { result } = renderNavigation(new Date(Date.UTC(2000, 0, 1)));

    expect(result.current.navigation.isToday).toBe(false);
  });

  it("draws the title a view reports and calls its latest buttons", () => {
    const { result } = renderNavigation(new Date());
    const next = vi.fn<() => void>();
    const reported: CalendarNavigation = {
      isToday: false,
      next,
      prev: vi.fn<() => void>(),
      title: "March 2026",
      today: vi.fn<() => void>(),
    };

    act(() => {
      result.current.handleNavigationChange(reported);
    });
    result.current.navigation.next();

    expect(result.current.navigation.title).toBe("March 2026");
    expect(next).toHaveBeenCalledExactlyOnceWith();
  });
});
