import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  readServedApi,
  serveCalendarApi,
} from "../../../../testing/calendar-api";
import {
  CATALOG,
  MetricCatalogFixture,
} from "../../../../testing/metrics/metric-catalog";

import { CalendarMetrics } from "./calendar-metrics";
import {
  EMPTY_CATALOG,
  MetricCatalogContext,
} from "./components/metric-catalog-provider/metric-catalog-provider.constants";

import type { UseMetricCatalogResult } from "../../../hooks/use-metric-layout/hooks/use-metric-catalog/use-metric-catalog.types";
import type { CalendarMetricsProperties } from "./calendar-metrics";
import type { ReactNode } from "react";

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

function renderBefore(
  status: UseMetricCatalogResult["status"],
  retry = vi.fn<() => void>(),
  view: "charts" | "totals" = "charts",
): void {
  render(
    <MetricCatalogContext
      value={{
        catalog: EMPTY_CATALOG,
        error:
          status === "error" ? new Error("The catalog is down") : undefined,
        retry,
        status,
      }}
    >
      <CalendarMetrics {...createProperties(view)} />
    </MetricCatalogContext>,
  );
}

function renderMetrics(properties: CalendarMetricsProperties): ReactNode {
  return (
    <MetricCatalogFixture>
      <CalendarMetrics {...properties} />
    </MetricCatalogFixture>
  );
}

describe(CalendarMetrics, () => {
  it("draws the Charts for the charts view, and the Totals for the totals", () => {
    serveCalendarApi();

    const { rerender } = render(renderMetrics(createProperties("charts")));

    expect(screen.getByTestId("calendar-charts")).toBeDefined();

    rerender(renderMetrics(createProperties("totals")));

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
    render(renderMetrics(createProperties("totals")));

    await waitFor(() => {
      expect(readServedApi().requests.metrics).toHaveLength(1);
    });

    const [request] = readServedApi().requests.metrics;

    expect(request?.metrics).toStrictEqual([...CATALOG.defaults.totals]);
    expect(request?.metrics).toContain("average-duration");
    expect(request?.compareToPrevious).toBe(false);
  });

  it("measures the metrics it is given, and compares when asked", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    render(
      renderMetrics(
        createProperties("charts", {
          compare: true,
          metrics: ["progressive-events"],
        }),
      ),
    );

    await waitFor(() => {
      expect(readServedApi().requests.metrics).toHaveLength(1);
    });

    expect(readServedApi().requests.metrics[0]).toMatchObject({
      compareToPrevious: true,
      metrics: ["progressive-events"],
    });
  });

  it("asks for no metrics, and shows a skeleton, until the catalog is read", () => {
    serveCalendarApi();
    renderBefore("loading");

    expect(
      screen.getByTestId("calendar-metrics").getAttribute("aria-busy"),
    ).toBe("true");
    expect(screen.queryByTestId("calendar-charts")).toBeNull();
    expect(readServedApi().requests.metrics).toHaveLength(0);
  });

  it("draws the Charts' skeleton in the charts view and the Totals' in the totals view, until the catalog is read", () => {
    serveCalendarApi();
    renderBefore("loading");

    expect(screen.getByTestId("skeleton-bars")).toBeDefined();
    expect(screen.queryByTestId("skeleton-cards")).toBeNull();

    cleanup();
    renderBefore("loading", undefined, "totals");

    expect(screen.getByTestId("skeleton-cards")).toBeDefined();
    expect(screen.queryByTestId("skeleton-bars")).toBeNull();
  });

  it("names the loading container by what the skeleton announces, once", () => {
    serveCalendarApi();
    renderBefore("loading");

    const region = screen.getByRole("region", { name: "Loading charts" });

    expect(region).toBe(screen.getByTestId("calendar-metrics"));
    expect(screen.getAllByText("Loading charts")).toHaveLength(1);
    expect(region.hasAttribute("aria-label")).toBe(false);
  });

  it("leaves a catalog that failed unnamed as a region", () => {
    serveCalendarApi();
    renderBefore("error");

    expect(screen.queryByRole("region")).toBeNull();
  });

  it("says why the catalog could not be read, and offers a retry", () => {
    const retry = vi.fn<() => void>();

    serveCalendarApi();
    renderBefore("error", retry);

    expect(screen.getByRole("alert").textContent).toContain(
      "The catalog is down",
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("calendar-charts")).toBeNull();
  });
});
