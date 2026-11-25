import type { EventMetricsData } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";
import type { SettledMetrics } from "./use-event-metrics.types";

// ♟️ Constants

/**
 * Metric reads kept, by their input, so stepping back reads nothing twice.
 */
export const METRICS_CACHE = new Map<string, Promise<EventMetricsData>>();

/**
 * Enough recent reads to step through a few windows and back.
 */
export const CACHED_METRIC_READS = 24;

/**
 * Nothing read yet.
 */
export const NOTHING_SETTLED: SettledMetrics = {
  error: undefined,
  key: "",
  status: "loading",
};

/**
 * Formats a zone's clock, by zone.
 */
export const ZONE_FORMATS = new Map<string, Intl.DateTimeFormat>();
