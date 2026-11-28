import type { MetricCatalog } from "../../calendar-metrics.types";

// 🏷️ Types

/**
 * How the catalog's read stands: the catalog once read, or why not.
 */
export interface SettledCatalog {
  catalog: MetricCatalog | undefined;
  error: Error | undefined;
}
