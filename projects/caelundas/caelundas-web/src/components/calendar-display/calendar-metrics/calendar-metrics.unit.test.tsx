import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  readServedApi,
  serveCalendarApi,
} from "../../../../testing/calendar-api";

import { CalendarMetrics } from "./calendar-metrics";

import type { CalendarMetricsProperties } from "./calendar-metrics";

function createProperties(
  view: "charts" | "totals",
  change: Partial<CalendarMetricsProperties> = {},
): CalendarMetricsProperties {
  return {
    anchor: new Date("2026-03-01T12:00:00.000Z"),
    className: "metric-layout",
    filter: undefined,
    grouping: [{ field: "tag:body" }],
    onDateChange: vi.fn<(date: Date) => void>(),
    onNavigationChange: vi.fn<() => void>(),
    sort: undefined,
    timeZone: "America/New_York",
    view,
    ...change,
  };
}

describe(CalendarMetrics, () => {
  it("draws the Charts for the charts view, and the Totals for the totals", () => {
    serveCalendarApi();

    const { rerender } = render(
      <CalendarMetrics {...createProperties("charts")} />,
    );

    expect(screen.getByTestId("calendar-charts")).toBeDefined();

    rerender(<CalendarMetrics {...createProperties("totals")} />);

    expect(screen.getByTestId("calendar-totals")).toBeDefined();
  });

  it("applies its class name", () => {
    serveCalendarApi();
    render(
      <CalendarMetrics
        {...createProperties("charts")}
        className="calendar-metrics"
      />,
    );

    expect(screen.getByTestId("calendar-metrics").className).toBe(
      "calendar-metrics",
    );
  });

  it("measures each layout's default metrics, without comparing, when it is given none", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    render(<CalendarMetrics {...createProperties("totals")} />);

    await waitFor(() => {
      expect(readServedApi().requests.metrics).toHaveLength(1);
    });

    const [request] = readServedApi().requests.metrics;

    expect(request?.metrics).toContain("PROGRESSIVE_HOURS");
    expect(request?.compareToPrevious).toBe(false);
  });

  it("measures the metrics it is given, and compares when asked", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    render(
      <CalendarMetrics
        {...createProperties("charts", { compare: true, metrics: ["SPANS"] })}
      />,
    );

    await waitFor(() => {
      expect(readServedApi().requests.metrics).toHaveLength(1);
    });

    expect(readServedApi().requests.metrics[0]).toMatchObject({
      compareToPrevious: true,
      metrics: ["SPANS"],
    });
  });
});
