import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MAXIMUM_AGENDA_DAYS } from "../../constants/calendar-views.constants";

import { useCalendarSearch } from "./use-calendar-search";

import type { CalendarSearch } from "../../types/calendar-search.types";

const navigate = vi.hoisted(() =>
  vi.fn<
    (options: {
      replace: boolean;
      search: (previous: CalendarSearch) => CalendarSearch;
    }) => Promise<void>
  >(),
);

vi.mock(import("@tanstack/react-router"), () => ({
  useNavigate: () => navigate as never,
}));

/**
 * The search the latest navigation wrote, over an empty one.
 */
function readWritten(): { replace: boolean; search: CalendarSearch } {
  const [options] = navigate.mock.lastCall ?? [];

  if (options === undefined) {
    throw new Error("Expected a navigation");
  }

  return { replace: options.replace, search: options.search({}) };
}

describe(useCalendarSearch, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));

    expect(result.current.getShowLater(MAXIMUM_AGENDA_DAYS)).toBeUndefined();
    expect(result.current).toStrictEqual({
      getShowLater: expect.any(Function),
      handleClustersChange: expect.any(Function),
      handleColorByChange: expect.any(Function),
      handleColorsChange: expect.any(Function),
      handleDateChange: expect.any(Function),
      handleFilterChange: expect.any(Function),
      handleGroupingChange: expect.any(Function),
      handleScaleChange: expect.any(Function),
      handleSymbolsChange: expect.any(Function),
      handleViewChange: expect.any(Function),
      updateSearch: expect.any(Function),
    });
  });

  it("pushes a new day as its own entry", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));

    result.current.handleDateChange(new Date(Date.UTC(2026, 2, 4)));

    expect(readWritten()).toStrictEqual({
      replace: false,
      search: { date: "2026-03-04" },
    });
  });

  it("writes a setting in place", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));

    result.current.handleClustersChange(false);

    expect(readWritten()).toStrictEqual({
      replace: true,
      search: { clusters: false },
    });
  });
});
