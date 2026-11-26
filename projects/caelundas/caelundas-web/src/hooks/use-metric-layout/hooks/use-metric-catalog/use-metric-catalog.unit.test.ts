import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CATALOG,
  MetricCatalogFixture,
} from "../../../../../testing/metrics/metric-catalog";
import { EMPTY_CATALOG } from "../../../../components/calendar-display/calendar-metrics/components/metric-catalog-provider/metric-catalog-provider.constants";

import { useMetricCatalog } from "./use-metric-catalog";

describe(useMetricCatalog, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useMetricCatalog());

    expect(result.current).toStrictEqual({
      catalog: EMPTY_CATALOG,
      error: undefined,
      retry: expect.any(Function) as () => void,
      status: "loading",
    });
    expect(() => {
      result.current.retry();
    }).not.toThrow();
  });

  it("hands over the catalog the provider above it holds", () => {
    const { result } = renderHook(() => useMetricCatalog(), {
      wrapper: MetricCatalogFixture,
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.catalog).toBe(CATALOG);
    expect(result.current.catalog.bySlug.get("events")?.name).toBe("Events");
  });
});
