import { useMemo } from "react";

import { flattenMetricGroups } from "../../../../components/calendar-display/calendar-metrics/components/calendar-metrics-tree/calendar-metrics-tree.utilities";

import type { EventMetricsData } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";
import type { UseMetricGroupRowsResult } from "./use-metric-group-rows.types";

// 🧩 Hook

/**
 * The groups of the metrics tree the layout shows: an open group gives way to its subgroups.
 */
export function useMetricGroupRows(
  data: EventMetricsData | undefined,
  expanded: ReadonlySet<string>,
): UseMetricGroupRowsResult {
  // 🪝 Hooks
  const rows = useMemo(
    () => flattenMetricGroups(data?.groups ?? [], expanded),
    [data, expanded],
  );

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🎁 Result
  return { rows };
}
