import {
  findMetricValue,
  isAdditiveMetric,
} from "../../../calendar-metrics/calendar-metrics.utilities";
import { getSharePercent } from "../../calendar-totals.utilities";

import type { EventMetric } from "../../../../../graphql/generated/operations";
import type { MetricGroup } from "../../../calendar-metrics/calendar-metrics.types";
import type { RowFigures } from "./totals-subtotal.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * A group's number for a metric, the previous period's, and its share of the whole when the metric adds up.
 */
export function readRowFigures(
  group: MetricGroup,
  metric: EventMetric,
  whole: null | number,
): RowFigures {
  const measured = findMetricValue(group.values, metric);
  const value = measured?.value ?? null;

  return {
    previous: measured?.previous ?? null,
    share: isAdditiveMetric(metric) ? getSharePercent(value, whole) : null,
    value,
  };
}
