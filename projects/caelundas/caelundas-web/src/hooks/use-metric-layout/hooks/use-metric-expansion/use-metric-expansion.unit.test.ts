import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMetricExpansion } from "./use-metric-expansion";

import type { EventMetricsData } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";

const DATA: EventMetricsData = {
  groups: [
    {
      children: [
        {
          id: "/0:alpha/1:one",
          key: "one",
          label: "One",
          level: 1,
          orderKey: null,
          path: null,
          values: [],
        },
      ],
      id: "/0:alpha",
      key: "alpha",
      label: "Alpha",
      level: 0,
      orderKey: null,
      path: null,
      values: [],
    },
  ],
  timezone: "UTC",
  total: [],
};

describe(useMetricExpansion, () => {
  it("shows nothing open until a group is opened or closed, when asked", () => {
    const { result } = renderHook(() => useMetricExpansion(DATA, true));

    expect(result.current.expanded.size).toBe(0);

    act(() => {
      result.current.toggle("/0:alpha", "red");
    });

    expect([...result.current.expanded]).toStrictEqual(["/0:alpha"]);
  });

  it("opens a group and the one above it", () => {
    const { result } = renderHook(() => useMetricExpansion(DATA, true));

    act(() => {
      result.current.open("/0:alpha", "/0:alpha/1:one");
    });

    expect([...result.current.expanded]).toStrictEqual([
      "/0:alpha",
      "/0:alpha/1:one",
    ]);
  });

  it("opens nothing for a group the tree does not hold", () => {
    const { result } = renderHook(() => useMetricExpansion(DATA, true));

    act(() => {
      result.current.open("/0:alpha", "/0:gone");
    });

    expect(result.current.expanded.size).toBe(0);
  });

  it("opens nothing before the tree arrives", () => {
    const { result } = renderHook(() => useMetricExpansion(undefined, false));

    act(() => {
      result.current.open("/0:alpha", "/0:alpha/1:one");
    });

    expect(result.current.expanded.size).toBe(0);
  });
});
