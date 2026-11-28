import { parseMetrics } from "../../../../calendar-display/calendar-metrics/calendar-metrics.utilities";

import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The metrics after a list click: ticked ones keep their place, newly ticked ones follow; one always stays, so the last cannot be cleared.
 */
export function toMetricList(
  next: readonly string[],
  previous: readonly string[],
): string[] {
  const ticked = parseMetrics(next) ?? [];
  const kept = previous.filter((metric) => ticked.includes(metric));
  const added = ticked.filter((metric) => !previous.includes(metric));
  const metrics = [...kept, ...added];

  return metrics.length === 0 ? [...previous] : metrics;
}

/**
 * What to tick in the list: the metrics, and each branch whose metrics are all among them, so its box shows ticked.
 */
export function toMetricValue(
  metrics: readonly string[],
  branches: readonly CascaderNode[],
): string[] {
  const value = [...metrics];

  for (const branch of branches) {
    const children = branch.children ?? [];

    if (
      children.length > 0 &&
      children.every((child) => metrics.includes(child.value))
    ) {
      value.push(branch.value);
    }
  }

  return value;
}
