import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { serveCalendarApi } from "../../../../../testing/calendar-api";

import { useEventMetrics } from "./use-event-metrics";

import type { UseEventMetricsOptions } from "./use-event-metrics.types";

const OPTIONS: UseEventMetricsOptions = {
  anchor: new Date("2026-03-01T12:00:00.000Z"),
  compare: false,
  filter: undefined,
  grouping: [{ field: "tag:body" }, { field: "tag:zodiac" }],
  metrics: ["EVENTS"],
  timeZone: "America/New_York",
};

describe(useEventMetrics, () => {
  it("returns its result", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const { result } = renderHook(() => useEventMetrics(OPTIONS));

    expect(result.current).toStrictEqual({
      data: undefined,
      error: undefined,
      refetch: expect.any(Function) as () => void,
      status: "loading",
    });

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });
  });

  it("loads, then answers the metrics of the days", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const { result } = renderHook(() => useEventMetrics(OPTIONS));

    expect(result.current.status).toBe("loading");
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.data?.total).toStrictEqual([
      { metric: "EVENTS", previous: null, value: 10 },
    ]);
    expect(result.current.data?.groups.map((group) => group.id)).toStrictEqual([
      "/0:alpha",
      "/0:beta",
    ]);
  });

  it("asks for the table's days in the zone, with the metrics and every level", async () => {
    expect.hasAssertions();

    const api = serveCalendarApi();

    renderHook(() => useEventMetrics(OPTIONS));

    await waitFor(() => {
      expect(api.requests.metrics).toHaveLength(1);
    });

    expect(api.requests.metrics[0]).toStrictEqual({
      compareToPrevious: false,
      filter: null,
      grouping: [{ field: "tag:body" }, { field: "tag:zodiac" }],
      metrics: ["EVENTS"],
      period: {
        end: "2026-03-31T04:00:00.000Z",
        start: "2026-03-01T05:00:00.000Z",
      },
    });
  });

  it("covers as many days as the link names, and compares when asked", async () => {
    expect.hasAssertions();

    const api = serveCalendarApi();

    renderHook(() =>
      useEventMetrics({ ...OPTIONS, agendaDays: 7, compare: true }),
    );

    await waitFor(() => {
      expect(api.requests.metrics).toHaveLength(1);
    });

    expect(api.requests.metrics[0]).toMatchObject({
      compareToPrevious: true,
      period: { end: "2026-03-08T05:00:00.000Z" },
    });
  });

  it("sends the filter's finished rules, and no grouping as none", async () => {
    expect.hasAssertions();

    const api = serveCalendarApi();

    renderHook(() =>
      useEventMetrics({
        ...OPTIONS,
        filter: {
          combinator: "and",
          id: "root",
          rules: [
            {
              id: "rule",
              operator: "is_any_of",
              path: ["tag:body"],
              type: "rule",
              value: ["tag-sun"],
            },
          ],
          type: "group",
        },
        grouping: [],
      }),
    );

    await waitFor(() => {
      expect(api.requests.metrics).toHaveLength(1);
    });

    expect(api.requests.metrics[0]?.grouping).toBeNull();
    expect(api.requests.metrics[0]?.filter).toStrictEqual({
      combinator: "AND",
      rules: [
        { operator: "is_any_of", path: ["tag:body"], values: ["tag-sun"] },
      ],
    });
  });

  it("keeps the last answer on screen while the next loads", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const { rerender, result } = renderHook(
      (options: UseEventMetricsOptions) => useEventMetrics(options),
      { initialProps: OPTIONS },
    );

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    const first = result.current.data;

    rerender({ ...OPTIONS, compare: true });

    expect(result.current.status).toBe("loading");
    expect(result.current.data).toBe(first);

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.data?.total[0]?.previous).toBe(9);
  });

  it("reads once for options that are the same by value", async () => {
    expect.hasAssertions();

    const api = serveCalendarApi();
    const { rerender, result } = renderHook(
      (options: UseEventMetricsOptions) => useEventMetrics(options),
      { initialProps: OPTIONS },
    );

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    rerender({ ...OPTIONS, grouping: [...OPTIONS.grouping] });

    expect(result.current.status).toBe("ready");
    expect(api.requests.metrics).toHaveLength(1);
  });

  it("reports a failure, keeping what it had, and reads again on refetch", async () => {
    expect.hasAssertions();

    const api = serveCalendarApi();
    const { rerender, result } = renderHook(
      (options: UseEventMetricsOptions) => useEventMetrics(options),
      { initialProps: OPTIONS },
    );

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    const first = result.current.data;

    api.fail("The API is down");
    rerender({ ...OPTIONS, compare: true });

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.error?.message).toBe("The API is down");
    expect(result.current.data).toBe(first);

    api.recover();
    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.data?.total[0]?.previous).toBe(9);
  });

  it("ignores an answer that arrives after it was left", async () => {
    expect.hasAssertions();

    const api = serveCalendarApi();
    const { result, unmount } = renderHook(() => useEventMetrics(OPTIONS));

    unmount();

    // The read finishes with nothing left to show it.
    await waitFor(() => {
      expect(api.requests.metrics).toHaveLength(1);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.status).toBe("loading");
  });
});
