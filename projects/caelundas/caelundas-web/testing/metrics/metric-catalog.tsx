import { render } from "@testing-library/react";

import { MetricCatalogContext } from "../../src/components/calendar-display/calendar-metrics/components/metric-catalog-provider/metric-catalog-provider.constants";
import { buildMetricCatalog } from "../../src/components/calendar-display/calendar-metrics/components/metric-catalog-provider/metric-catalog-provider.utilities";

import { METRIC_CATALOG_FIXTURE } from "./metric-catalog-fixture";

import type {
  MetricCatalog,
  MetricDescriptor,
} from "../../src/components/calendar-display/calendar-metrics/calendar-metrics.types";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * The API's catalog, as the web code reads it once loaded.
 */
export const CATALOG: MetricCatalog = buildMetricCatalog(
  METRIC_CATALOG_FIXTURE,
);

/**
 * One of the catalog's metrics by its slug; fails for a slug it lacks.
 */
export function getMetric(slug: string): MetricDescriptor {
  const metric = CATALOG.bySlug.get(slug);

  if (metric === undefined) {
    throw new Error(`The catalog fixture has no metric ${slug}`);
  }

  return metric;
}

/**
 * Renders its children over the catalog, already loaded, so a test needs no provider or API.
 */
export function MetricCatalogFixture(
  properties: Readonly<{ children?: ReactNode }>,
): ReactNode {
  return (
    <MetricCatalogContext
      value={{
        catalog: CATALOG,
        error: undefined,
        retry: () => {},
        status: "ready",
      }}
    >
      {properties.children}
    </MetricCatalogContext>
  );
}

/**
 * Renders a component over the loaded catalog; its rerenders keep it too.
 */
export function renderWithCatalog(
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult {
  return render(ui, { ...options, wrapper: MetricCatalogFixture });
}
