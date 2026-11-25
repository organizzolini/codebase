import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCalendarSearch } from "./use-calendar-search";

import type { CalendarSearch } from "./calendar-search.types";

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

    expect(result.current).toStrictEqual({
      handleClustersChange: expect.any(Function),
      handleColorsChange: expect.any(Function),
      handleColumnsChange: expect.any(Function),
      handleCompareChange: expect.any(Function),
      handleDateChange: expect.any(Function),
      handleFilterChange: expect.any(Function),
      handleGroupingChange: expect.any(Function),
      handleMetricsChange: expect.any(Function),
      handleRangeChange: expect.any(Function),
      handleScaleChange: expect.any(Function),
      handleSortChange: expect.any(Function),
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

  it("drops an empty grouping or sort from the link, the default standing for none", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));

    result.current.handleGroupingChange([]);

    expect(readWritten().search.group).toBeUndefined();

    result.current.handleSortChange([]);

    expect(readWritten().search.sort).toBeUndefined();

    result.current.handleGroupingChange([{ field: "tag:type" }]);

    expect(readWritten().search.group).toStrictEqual([{ field: "tag:type" }]);
  });

  it("writes the comparison in place, dropping it when off", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));

    result.current.handleCompareChange(true);

    expect(readWritten()).toStrictEqual({
      replace: true,
      search: { compare: true },
    });

    result.current.handleCompareChange(false);

    expect(readWritten().search.compare).toBeUndefined();
  });

  it("writes the metrics, dropping an empty list for the layout's defaults", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));

    result.current.handleMetricsChange(["EVENTS", "SPANS"]);

    expect(readWritten()).toStrictEqual({
      replace: false,
      search: { metrics: ["EVENTS", "SPANS"] },
    });

    result.current.handleMetricsChange([]);

    expect(readWritten().search.metrics).toBeUndefined();

    result.current.handleMetricsChange(undefined);

    expect(readWritten().search.metrics).toBeUndefined();
  });

  it("writes a range as the table's days, the timeline's scale, or the first day", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));
    const november = { from: "2026-11-01", to: "2026-11-30" };

    result.current.handleRangeChange("table", november);

    expect(readWritten().search).toStrictEqual({
      date: "2026-11-01",
      days: 30,
    });

    result.current.handleRangeChange("timeline", november);

    expect(readWritten().search).toStrictEqual({
      date: "2026-11-01",
      scale: "month",
    });

    result.current.handleRangeChange("month", november);

    expect(readWritten().search).toStrictEqual({ date: "2026-11-01" });

    // The metric layouts read the table's days.
    result.current.handleRangeChange("charts", november);

    expect(readWritten().search).toStrictEqual({
      date: "2026-11-01",
      days: 30,
    });

    result.current.handleRangeChange("totals", november);

    expect(readWritten().search).toStrictEqual({
      date: "2026-11-01",
      days: 30,
    });
  });
});
