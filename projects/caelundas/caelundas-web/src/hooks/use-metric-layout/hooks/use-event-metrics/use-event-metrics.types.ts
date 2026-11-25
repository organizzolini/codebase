// 🏷️ Types

import type { EventMetricsData } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";
import type { EventFilterQuery } from "../../../../components/calendar-query/calendar-filters/components/event-filter-model/event-filters.types";
import type { EventGroupLevel } from "../../../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { EventMetric } from "../../../../graphql/generated/operations";

/**
 * How the last settled read ended, and the read it was for.
 */
export interface SettledMetrics {
  error: Error | undefined;
  key: string;
  status: "error" | "loading" | "ready";
}

/**
 * What the metrics are of: days, filter, grouping, metrics, and comparison.
 */
export interface UseEventMetricsOptions {
  /**
   * How many days from the anchor's day; the table's default when absent.
   */
  agendaDays?: number | undefined;
  anchor: Date;
  compare: boolean;
  filter: EventFilterQuery | undefined;
  grouping: readonly EventGroupLevel[];
  metrics: readonly EventMetric[];
  timeZone: string;
}

/**
 * The metrics read, how the read stands, and a way to reread.
 */
export interface UseEventMetricsResult {
  /**
   * The last answer, kept while the next is read; absent before the first.
   */
  data: EventMetricsData | undefined;
  /**
   * Why the last read failed, while `status` is `error`.
   */
  error: Error | undefined;
  /**
   * Forgets the cached answer and asks the API again.
   */
  refetch: () => void;
  status: "error" | "loading" | "ready";
}
