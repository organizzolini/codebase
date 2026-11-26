import { findMetricValue } from "../../components/calendar-display/calendar-metrics/calendar-metrics.utilities";
import { getSortMetric } from "../../components/calendar-display/calendar-metrics/components/calendar-metrics-tree/calendar-metrics-tree.utilities";
import { pruneEmptyGroups } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-prune.utilities";

import { EVENTS_METRIC } from "./use-metric-layout.constants";

import type {
  EventMetricsData,
  MetricGroup,
} from "../../components/calendar-display/calendar-metrics/calendar-metrics.types";
import type { GroupSort } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The metrics to read with the event count among them when empty groups are hidden, since that count tells which are empty.
 */
export function addEventsMetric(
  metrics: readonly string[],
  hideEmpty: boolean,
): readonly string[] {
  return hideEmpty && !metrics.includes(EVENTS_METRIC)
    ? [...metrics, EVENTS_METRIC]
    : metrics;
}

/**
 * The metrics to read: those shown, then any a sort orders by that are not, so a sort never ranks by nothing.
 */
export function addSortMetrics(
  metrics: readonly string[],
  sorts: readonly GroupSort[] | undefined,
): readonly string[] {
  const wanted = new Set(metrics);

  for (const sort of sorts ?? []) {
    const metric = getSortMetric(sort);

    if (metric !== undefined) {
      wanted.add(metric);
    }
  }

  return wanted.size === metrics.length ? metrics : [...wanted];
}

/**
 * The groups without those that count no events, nor have a subgroup that counts some.
 */
export function hideEmptyMetricGroups(
  groups: readonly MetricGroup[],
): MetricGroup[] {
  return pruneEmptyGroups(groups, (group) => {
    const count = findMetricValue(group.values, EVENTS_METRIC)?.value ?? 0;

    return count > 0;
  });
}

/**
 * The totals of the metrics shown only, the others having been read to sort by or to tell which groups are empty.
 */
export function keepShownTotals(
  data: EventMetricsData,
  metrics: readonly string[],
): EventMetricsData {
  return data.total.every((value) => metrics.includes(value.metric))
    ? data
    : {
        ...data,
        total: data.total.filter((value) => metrics.includes(value.metric)),
      };
}

/**
 * The metrics to read: those shown, then any a sort orders by, and the event count when empty groups are hidden.
 */
export function listReadMetrics(
  metrics: readonly string[],
  options: Readonly<{
    hideEmpty: boolean;
    sort: readonly GroupSort[] | undefined;
  }>,
): readonly string[] {
  return addEventsMetric(
    addSortMetrics(metrics, options.sort),
    options.hideEmpty,
  );
}
