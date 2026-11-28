import { createContext } from "react";

import type { EventMetricCatalogQuery } from "../../../../../graphql/generated/operations";
import type { UseMetricCatalogResult } from "../../../../../hooks/use-metric-layout/hooks/use-metric-catalog/use-metric-catalog.types";
import type { MetricCatalog } from "../../calendar-metrics.types";

// ♟️ Constants

/**
 * The catalog's answer, kept so it is asked for once.
 */
export const CATALOG_CACHE = new Map<
  string,
  Promise<EventMetricCatalogQuery["eventMetricCatalog"]>
>();

/**
 * The key the catalog is kept under.
 */
export const CATALOG_KEY = "catalog";

/**
 * What the catalog holds before it arrives: no metrics, and no defaults.
 */
export const EMPTY_CATALOG: MetricCatalog = {
  bySlug: new Map(),
  defaults: { charts: [], totals: [] },
  measures: [],
  metrics: [],
};

/**
 * Holds the catalog for the components beneath the provider.
 */
export const MetricCatalogContext = createContext<UseMetricCatalogResult>({
  catalog: EMPTY_CATALOG,
  error: undefined,
  retry: () => {},
  status: "loading",
});
