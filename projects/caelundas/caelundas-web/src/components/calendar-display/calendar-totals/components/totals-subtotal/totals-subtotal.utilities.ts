import { findMetricValue } from "../../../calendar-metrics/calendar-metrics.utilities";
import { getSharePercent } from "../../calendar-totals.utilities";

import type {
  MetricDescriptor,
  MetricGroup,
} from "../../../calendar-metrics/calendar-metrics.types";
import type { RowFigures } from "./totals-subtotal.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * A group's number for a metric, the previous period's, and its share of the whole when the metric adds up.
 */
export function readRowFigures(
  group: MetricGroup,
  metric: MetricDescriptor,
  whole: null | number,
): RowFigures {
  const measured = findMetricValue(group.values, metric.slug);
  const value = measured?.value ?? null;

  return {
    previous: measured?.previous ?? null,
    share: metric.additive ? getSharePercent(value, whole) : null,
    value,
  };
}
