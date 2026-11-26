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
 * The search the latest navigation wrote, over an empty one or the one given.
 */
function readWritten(previous: CalendarSearch = {}): {
  replace: boolean;
  search: CalendarSearch;
} {
  const [options] = navigate.mock.lastCall ?? [];

  if (options === undefined) {
    throw new Error("Expected a navigation");
  }

  return { replace: options.replace, search: options.search(previous) };
}

describe(useCalendarSearch, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));

    expect(result.current).toStrictEqual({
      handleColorsChange: expect.any(Function),
      handleColumnsChange: expect.any(Function),
      handleCompareChange: expect.any(Function),
      handleDateChange: expect.any(Function),
      handleFilterChange: expect.any(Function),
      handleFoldChange: expect.any(Function),
      handleGroupingChange: expect.any(Function),
      handleHideEmptyChange: expect.any(Function),
      handleMetricsChange: expect.any(Function),
      handleRangeChange: expect.any(Function),
      handleScaleChange: expect.any(Function),
      handleSortChange: expect.any(Function),
      handleSymbolsChange: expect.any(Function),
      handleViewChange: expect.any(Function),
      handleViewPresetChange: expect.any(Function),
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

    result.current.handleColorsChange(false);

    expect(readWritten()).toStrictEqual({
      replace: true,
      search: { colors: false },
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

  it("writes a view's filter, group and sort in one entry, leaving the rest of the link", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));
    const filter = {
      combinator: "and" as const,
      id: "filter",
      rules: [],
      type: "group" as const,
    };

    result.current.handleViewPresetChange({
      filter,
      group: [{ field: "tag:type" }],
      sort: undefined,
    });

    expect(readWritten({ date: "2026-01-02", view: "table" })).toStrictEqual({
      replace: false,
      search: {
        date: "2026-01-02",
        filter,
        group: [{ field: "tag:type" }],
        sort: undefined,
        view: "table",
      },
    });
  });

  it("writes the folded strips in place, dropping them when none is folded", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));

    result.current.handleFoldChange("select,group");

    expect(readWritten()).toStrictEqual({
      replace: true,
      search: { fold: "select,group" },
    });

    result.current.handleFoldChange(undefined);

    expect(readWritten().search.fold).toBeUndefined();
  });

  describe("columns", () => {
    const SORTS = [
      { direction: "asc", key: "name" },
      { direction: "desc", key: "duration" },
      { direction: "asc", key: "count" },
    ] as const;

    it("writes them as their own entry", () => {
      const { result } = renderHook(() => useCalendarSearch("UTC"));

      result.current.handleColumnsChange(["name", "start"]);

      expect(readWritten()).toStrictEqual({
        replace: false,
        search: { columns: ["name", "start"], sort: undefined },
      });
    });

    it("takes the sorts of a column no longer shown away in the same entry", () => {
      const { result } = renderHook(() => useCalendarSearch("UTC"));

      result.current.handleColumnsChange(["name", "start"]);

      expect(readWritten({ sort: SORTS }).search).toStrictEqual({
        columns: ["name", "start"],
        sort: [SORTS[0], SORTS[2]],
      });
    });

    it("keeps every sort while every column stays", () => {
      const { result } = renderHook(() => useCalendarSearch("UTC"));

      result.current.handleColumnsChange(["name", "duration"]);

      expect(readWritten({ sort: SORTS }).search.sort).toStrictEqual(SORTS);
    });
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

  it("writes hiding empty groups in place, dropping it when off", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));

    result.current.handleHideEmptyChange(true);

    expect(readWritten()).toStrictEqual({
      replace: true,
      search: { hideEmpty: true },
    });

    result.current.handleHideEmptyChange(false);

    expect(readWritten().search.hideEmpty).toBeUndefined();
  });

  it("writes the metrics, dropping an empty list for the layout's defaults", () => {
    const { result } = renderHook(() => useCalendarSearch("UTC"));

    result.current.handleMetricsChange(["events", "progressive-events"]);

    expect(readWritten()).toStrictEqual({
      replace: false,
      search: { metrics: ["events", "progressive-events"] },
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
