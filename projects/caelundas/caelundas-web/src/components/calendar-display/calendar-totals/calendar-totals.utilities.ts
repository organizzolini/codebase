import { findMetricValue } from "../calendar-metrics/calendar-metrics.utilities";

import { FULL_PERCENT } from "./calendar-totals.constants";

import type { EventMetric } from "../../../graphql/generated/operations";
import type {
  MetricGroup,
  MetricNode,
} from "../calendar-metrics/calendar-metrics.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * A group's own color by its key, else its nearest colored ancestor's; none when colors are off.
 */
export function findGroupColor(
  node: MetricNode,
  colors: ReadonlyMap<string, string> | undefined,
): string | undefined {
  if (colors === undefined) {
    return undefined;
  }

  const chain = [node.group, ...node.ancestors.toReversed()];

  for (const group of chain) {
    const color = group.key === null ? undefined : colors.get(group.key);

    if (color !== undefined) {
      return color;
    }
  }

  return undefined;
}

/**
 * A group's value for a metric; none when the group lacks it.
 */
export function findGroupValue(
  group: MetricGroup,
  metric: EventMetric,
): null | number {
  return findMetricValue(group.values, metric)?.value ?? null;
}

/**
 * A group's share of the whole, in percent from 0 to 100; none when either is unknown or the whole is nothing.
 */
export function getSharePercent(
  value: null | number,
  total: null | number,
): null | number {
  if (value === null || total === null || total <= 0) {
    return null;
  }

  return Math.min(FULL_PERCENT, Math.max(0, (value / total) * FULL_PERCENT));
}
