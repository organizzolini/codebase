import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMetricGroupRows } from "./use-metric-group-rows";

import type {
  EventMetricsData,
  MetricGroup,
} from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";

function group(id: string, children?: readonly MetricGroup[]): MetricGroup {
  return {
    ...(children === undefined ? {} : { children }),
    id,
    key: id,
    label: id,
    level: id.split("/").length - 2,
    path: null,
    rank: id,
    values: [],
  };
}

const DATA: EventMetricsData = {
  groups: [
    group("/0:a", [group("/0:a/1:x"), group("/0:a/1:y")]),
    group("/0:b"),
  ],
  timezone: "UTC",
  total: [],
};

describe(useMetricGroupRows, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useMetricGroupRows(DATA, new Set()));

    expect(result.current).toStrictEqual({
      rows: expect.any(Array) as unknown[],
    });
  });

  it("shows no groups before the metrics arrive", () => {
    const { result } = renderHook(() =>
      useMetricGroupRows(undefined, new Set()),
    );

    expect(result.current).toStrictEqual({ rows: [] });
  });

  it("shows each group as itself while none is open", () => {
    const { result } = renderHook(() => useMetricGroupRows(DATA, new Set()));

    expect(result.current.rows.map((node) => node.group.id)).toStrictEqual([
      "/0:a",
      "/0:b",
    ]);
  });

  it("shows an open group's subgroups in its place", () => {
    const { result } = renderHook(() =>
      useMetricGroupRows(DATA, new Set(["/0:a"])),
    );

    expect(result.current.rows.map((node) => node.group.id)).toStrictEqual([
      "/0:a/1:x",
      "/0:a/1:y",
      "/0:b",
    ]);
  });

  it("follows the groups that are open as they change", () => {
    const { rerender, result } = renderHook(
      (expanded: ReadonlySet<string>) => useMetricGroupRows(DATA, expanded),
      { initialProps: new Set<string>() },
    );

    rerender(new Set(["/0:a"]));

    expect(result.current.rows).toHaveLength(3);
  });
});
