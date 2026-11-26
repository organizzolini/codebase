import { useContext } from "react";

import { MetricCatalogContext } from "../../../../components/calendar-display/calendar-metrics/components/metric-catalog-provider/metric-catalog-provider.constants";

import type { UseMetricCatalogResult } from "./use-metric-catalog.types";

// 🧩 Hook

/**
 * Reads the API's metric catalog the provider above holds, with its status: loading and empty until it arrives.
 */
export function useMetricCatalog(): UseMetricCatalogResult {
  // 🪝 Hooks
  const state = useContext(MetricCatalogContext);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🎁 Result
  return { ...state };
}
