import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, use } from "react";
import { describe, expect, it, vi } from "vitest";

import { serveCalendarApi } from "../../../testing/calendar-api";
import { TableGroupsProvider } from "../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider";
import { TableGroupsContext } from "../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";

import { useMetricLayout } from "./use-metric-layout";

import type { UseMetricLayoutOptions } from "./use-metric-layout.types";
import type { ReactNode } from "react";

function createOptions(
  change: Partial<UseMetricLayoutOptions> = {},
): UseMetricLayoutOptions {
  return {
    anchor: new Date("2026-03-01T12:00:00.000Z"),
    compare: false,
    filter: undefined,
    grouping: [{ field: "tag:body" }, { field: "tag:zodiac" }],
    metrics: ["EVENTS"],
    onDateChange: vi.fn<(date: Date) => void>(),
    onNavigationChange: vi.fn<() => void>(),
    sort: undefined,
    timeZone: "America/New_York",
    ...change,
  };
}

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return createElement(TableGroupsProvider, null, children);
}

describe(useMetricLayout, () => {
  it("returns its result", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const options = createOptions();
    const { result } = renderHook(() => useMetricLayout(options), { wrapper });

    expect(result.current).toStrictEqual({
      data: undefined,
      error: undefined,
      expanded: new Set<string>(),
      open: expect.any(Function) as () => void,
      refetch: expect.any(Function) as () => void,
      rows: [],
      status: "loading",
      toggle: expect.any(Function) as () => void,
    });

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });
  });

  it("shows only the top-level groups until a group is toggled, when asked", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const options = createOptions({ rootsUntilTouched: true });
    const { result } = renderHook(() => useMetricLayout(options), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.expanded.size).toBe(0);
    expect(result.current.rows.map((row) => row.group.id)).toStrictEqual([
      "/0:alpha",
      "/0:beta",
    ]);

    act(() => {
      result.current.toggle("/0:beta");
    });

    // The first toggle opens that group alone, not the lazy first path.
    expect([...result.current.expanded]).toStrictEqual(["/0:beta"]);
    expect(result.current.rows.map((row) => row.group.id)).toStrictEqual([
      "/0:alpha",
      "/0:beta/1:one",
      "/0:beta/1:two",
    ]);

    act(() => {
      result.current.toggle("/0:beta");
    });

    expect(result.current.rows.map((row) => row.group.id)).toStrictEqual([
      "/0:alpha",
      "/0:beta",
    ]);
  });

  it("shows the first path of groups open, as the table does", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const options = createOptions();
    const { result } = renderHook(() => useMetricLayout(options), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect([...result.current.expanded]).toStrictEqual([
      "/0:alpha",
      "/0:alpha/1:one",
    ]);
    // The first group is open, so its subgroups stand in its place.
    expect(result.current.rows.map((row) => row.group.id)).toStrictEqual([
      "/0:alpha/1:one",
      "/0:alpha/1:two",
      "/0:beta",
    ]);
  });

  it("opens and closes a group by its id", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const options = createOptions();
    const { result } = renderHook(() => useMetricLayout(options), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toHaveLength(3);
    });

    act(() => {
      result.current.toggle("/0:beta");
    });

    expect(result.current.rows.map((row) => row.group.id)).toStrictEqual([
      "/0:alpha/1:one",
      "/0:alpha/1:two",
      "/0:beta/1:one",
      "/0:beta/1:two",
    ]);

    act(() => {
      result.current.toggle("/0:alpha");
    });

    expect(result.current.rows.map((row) => row.group.id)).toStrictEqual([
      "/0:alpha",
      "/0:beta/1:one",
      "/0:beta/1:two",
    ]);
  });

  it("names the group a toggle opens for the Group strip, and forgets it once closed", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const options = createOptions({ rootsUntilTouched: true });
    const { result } = renderHook(
      () => ({
        groups: use(TableGroupsContext),
        layout: useMetricLayout(options),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.layout.status).toBe("ready");
    });

    act(() => {
      result.current.layout.toggle("/0:beta", "blue");
    });

    expect(result.current.groups.state.picked).toStrictEqual([
      { color: "blue", id: "/0:beta", label: "Beta" },
    ]);

    act(() => {
      result.current.layout.toggle("/0:beta");
    });

    expect(result.current.groups.state.picked).toStrictEqual([]);
  });

  it("opens the groups named over the top-level ones, naming the last", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const options = createOptions({ rootsUntilTouched: true });
    const { result } = renderHook(
      () => ({
        groups: use(TableGroupsContext),
        layout: useMetricLayout(options),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.layout.status).toBe("ready");
    });

    act(() => {
      result.current.layout.open("/0:alpha", "/0:alpha/1:one");
    });

    expect([...result.current.layout.expanded]).toStrictEqual([
      "/0:alpha",
      "/0:alpha/1:one",
    ]);
    expect(result.current.groups.state.picked).toStrictEqual([
      { color: undefined, id: "/0:alpha/1:one", label: "One" },
    ]);
  });

  it("names nothing for a group the tree does not hold", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const options = createOptions({ rootsUntilTouched: true });
    const { result } = renderHook(
      () => ({
        groups: use(TableGroupsContext),
        layout: useMetricLayout(options),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.layout.status).toBe("ready");
    });

    act(() => {
      result.current.layout.toggle("/0:gone");
      result.current.layout.open("/0:alpha", "/0:gone");
    });

    expect(result.current.groups.state.picked).toStrictEqual([]);
  });

  it("keeps the groups open through a change of the metrics", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const { rerender, result } = renderHook(
      (options: UseMetricLayoutOptions) => useMetricLayout(options),
      { initialProps: createOptions(), wrapper },
    );

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    act(() => {
      result.current.toggle("/0:beta");
    });
    rerender(createOptions({ compare: true }));

    await waitFor(() => {
      expect(result.current.data?.total[0]?.previous).toBe(9);
    });

    expect([...result.current.expanded].toSorted()).toStrictEqual([
      "/0:alpha",
      "/0:alpha/1:one",
      "/0:beta",
    ]);
  });

  it("sorts the groups at every level before it shows them", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const options = createOptions({
      sort: [{ direction: "desc", key: "name" }],
    });
    const { result } = renderHook(() => useMetricLayout(options), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.data?.groups.map((group) => group.id)).toStrictEqual([
      "/0:beta",
      "/0:alpha",
    ]);
    expect(result.current.rows.map((row) => row.group.id)).toStrictEqual([
      "/0:beta/1:two",
      "/0:beta/1:one",
      "/0:alpha",
    ]);
  });

  it("keeps its own open groups without a provider", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const options = createOptions();
    const { result } = renderHook(() => useMetricLayout(options));

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.rows.map((row) => row.group.id)).toStrictEqual([
      "/0:alpha/1:one",
      "/0:alpha/1:two",
      "/0:beta",
    ]);

    act(() => {
      result.current.toggle("/0:beta");
    });

    expect(result.current.rows).toHaveLength(4);
  });

  it("reports the toolbar's navigation by days", () => {
    serveCalendarApi();

    const options = createOptions();

    renderHook(() => useMetricLayout(options), { wrapper });

    expect(options.onNavigationChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: "2026-03-01 – 2026-03-30" }),
    );
  });
});
