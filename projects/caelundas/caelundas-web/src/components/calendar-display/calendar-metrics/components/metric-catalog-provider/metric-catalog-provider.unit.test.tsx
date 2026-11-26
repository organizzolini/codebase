import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  readServedApi,
  serveCalendarApi,
} from "../../../../../../testing/calendar-api";
import { CATALOG } from "../../../../../../testing/metrics/metric-catalog";
import { useMetricCatalog } from "../../../../../hooks/use-metric-layout/hooks/use-metric-catalog/use-metric-catalog";

import { MetricCatalogProvider } from "./metric-catalog-provider";
import { CATALOG_CACHE } from "./metric-catalog-provider.constants";
import { readMetricCatalog } from "./metric-catalog-provider.utilities";

import type { ReactNode } from "react";

function Reader(): ReactNode {
  const { catalog, error, retry, status } = useMetricCatalog();

  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="names">
        {catalog.metrics.map((metric) => metric.slug).join(",")}
      </p>
      <p data-testid="error">{error?.message}</p>
      <button
        onClick={retry}
        type="button"
      >
        Retry
      </button>
    </div>
  );
}

describe(MetricCatalogProvider, () => {
  it("applies its class name", () => {
    serveCalendarApi();
    render(<MetricCatalogProvider className="metric-catalog-provider" />);

    expect(screen.getByTestId("metric-catalog-provider").className).toBe(
      "metric-catalog-provider",
    );
  });

  it("is loading until the API answers, then hands every reader the catalog", async () => {
    serveCalendarApi();
    render(
      <MetricCatalogProvider>
        <Reader />
      </MetricCatalogProvider>,
    );

    expect(screen.getByTestId("status").textContent).toBe("loading");
    expect(screen.getByTestId("names").textContent).toBe("");

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("ready");
    });

    expect(screen.getByTestId("names").textContent).toBe(
      CATALOG.metrics.map((metric) => metric.slug).join(","),
    );
  });

  it("reads the API once, however often it is mounted", async () => {
    serveCalendarApi();

    const { unmount } = render(
      <MetricCatalogProvider>
        <Reader />
      </MetricCatalogProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("ready");
    });
    unmount();
    render(
      <MetricCatalogProvider>
        <Reader />
      </MetricCatalogProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("ready");
    });

    expect(readServedApi().requests.catalog).toBe(1);
  });

  it("lets go of an answer, or a failure, that arrives after it unmounted", async () => {
    serveCalendarApi();

    const first = render(
      <MetricCatalogProvider>
        <Reader />
      </MetricCatalogProvider>,
    );

    first.unmount();

    await expect(readMetricCatalog()).resolves.toBeDefined();

    CATALOG_CACHE.clear();
    serveCalendarApi({ catalogError: "The catalog is down" });

    const second = render(
      <MetricCatalogProvider>
        <Reader />
      </MetricCatalogProvider>,
    );

    second.unmount();

    await expect(readMetricCatalog()).rejects.toThrow("The catalog is down");
    expect(screen.queryByTestId("status")).toBeNull();
  });

  it("says why the read failed, and reads again on retry", async () => {
    const api = serveCalendarApi({ catalogError: "The catalog is down" });

    render(
      <MetricCatalogProvider>
        <Reader />
      </MetricCatalogProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("error");
    });

    expect(screen.getByTestId("error").textContent).toBe("The catalog is down");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(api.requests.catalog).toBe(2);
    });
    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("error");
    });
  });
});
