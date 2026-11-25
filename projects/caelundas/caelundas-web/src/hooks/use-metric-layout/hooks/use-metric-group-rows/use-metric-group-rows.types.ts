// 🏷️ Types

import type { MetricNode } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";

/**
 * The groups the layout shows now, in order.
 */
export interface UseMetricGroupRowsResult {
  /**
   * Each open group's subgroups in its place, the others as themselves.
   */
  rows: readonly MetricNode[];
}
