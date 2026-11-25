import { METRIC_BRANCH_PREFIX } from "../../../../calendar-display/calendar-metrics/calendar-metrics.constants";
import { parseMetrics } from "../../../../calendar-display/calendar-metrics/calendar-metrics.utilities";

import type { EventMetric } from "../../../../../graphql/generated/operations";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Whether a row of the metrics list is a metric to tick, not a branch that only groups them.
 */
export function isMetricChoice(node: Readonly<CascaderNode>): boolean {
  return !node.value.startsWith(METRIC_BRANCH_PREFIX);
}

/**
 * The metrics after a list click: ticked ones keep their place, newly ticked ones follow; one always stays, so the last cannot be cleared.
 */
export function toMetricList(
  next: readonly string[],
  previous: readonly EventMetric[],
): EventMetric[] {
  const ticked = parseMetrics(next) ?? [];
  const kept = previous.filter((metric) => ticked.includes(metric));
  const added = ticked.filter((metric) => !previous.includes(metric));
  const metrics = [...kept, ...added];

  return metrics.length === 0 ? [...previous] : metrics;
}
