import type { MetricCatalog } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";

// 🏷️ Types

/**
 * The catalog, how its read stands, and a way to retry.
 */
export interface UseMetricCatalogResult {
  /**
   * The metrics, empty until `status` is `ready`.
   */
  catalog: MetricCatalog;
  /**
   * Why the read failed, while `status` is `error`.
   */
  error: Error | undefined;
  /**
   * Forgets the failed read and asks the API again.
   */
  retry: () => void;
  status: "error" | "loading" | "ready";
}
