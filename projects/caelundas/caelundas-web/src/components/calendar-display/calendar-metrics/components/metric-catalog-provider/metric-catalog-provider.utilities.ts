import { findMetricCatalog } from "../../../events-calendar/components/events-api/events-api.utilities";
import { DEFAULT_METRICS } from "../../calendar-metrics.constants";

import {
  CATALOG_CACHE,
  CATALOG_KEY,
} from "./metric-catalog-provider.constants";

import type { EventMetricCatalogQuery } from "../../../../../graphql/generated/operations";
import type { UseMetricCatalogResult } from "../../../../../hooks/use-metric-layout/hooks/use-metric-catalog/use-metric-catalog.types";
import type {
  MetricCatalog,
  MetricDescriptor,
} from "../../calendar-metrics.types";
import type { SettledCatalog } from "./metric-catalog-provider.types";

// 🔏 Private Functions

/**
 * Asks the API for the catalog once and keeps the answer; a failed read is forgotten, so the next asks again.
 */
export async function askMetricCatalog(): Promise<
  EventMetricCatalogQuery["eventMetricCatalog"]
> {
  const kept = CATALOG_CACHE.get(CATALOG_KEY);

  if (kept !== undefined) {
    return kept;
  }

  const read = findMetricCatalog();

  CATALOG_CACHE.set(CATALOG_KEY, read);
  read.catch(() => {
    forgetMetricCatalog();
  });

  return read;
}

/**
 * Indexes the API's metrics by slug, in the order it gave them, with each layout's default metrics the catalog has.
 */
export function buildMetricCatalog(
  answer: Readonly<EventMetricCatalogQuery["eventMetricCatalog"]>,
): MetricCatalog {
  const bySlug = new Map<string, MetricDescriptor>();

  for (const metric of answer.metrics) {
    bySlug.set(metric.slug, metric);
  }

  return {
    bySlug,
    defaults: {
      charts: DEFAULT_METRICS.charts.filter((slug) => bySlug.has(slug)),
      totals: DEFAULT_METRICS.totals.filter((slug) => bySlug.has(slug)),
    },
    measures: answer.measures,
    metrics: answer.metrics,
  };
}

/**
 * Forgets the catalog kept, so the next read asks the API again.
 */
export function forgetMetricCatalog(): void {
  CATALOG_CACHE.delete(CATALOG_KEY);
}

// 🌎 Public Functions

/**
 * Reads the catalog, asking the API only the first time.
 */
export async function readMetricCatalog(): Promise<MetricCatalog> {
  return buildMetricCatalog(await askMetricCatalog());
}

/**
 * How a read stands: ready with the catalog, an error without it but with a cause, else loading.
 */
export function toCatalogStatus(
  settled: Readonly<SettledCatalog>,
): UseMetricCatalogResult["status"] {
  if (settled.catalog !== undefined) {
    return "ready";
  }

  return settled.error === undefined ? "loading" : "error";
}
