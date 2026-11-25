import { METRIC_CATALOG } from "../../calendar-metrics.constants";
import { formatMetricValue } from "../../calendar-metrics.utilities";
import { COMPACT_SPAN } from "../calendar-metrics-span/calendar-metrics-span.constants";
import {
  formatDurationSpan,
  formatHoursSpan,
} from "../calendar-metrics-span/calendar-metrics-span.utilities";

import type { EventMetric } from "../../../../../graphql/generated/operations";

// 🌎 Public Functions

/**
 * A metric's number in little room: durations and hours as abbreviated spans of three units, anything else as formatMetricValue writes it.
 */
export function formatMetricValueCompact(
  metric: EventMetric,
  value: null | number,
  timeZone = "UTC",
): string {
  const { format } = METRIC_CATALOG[metric];

  if (value !== null && format === "duration") {
    return formatDurationSpan(value, COMPACT_SPAN);
  }

  if (value !== null && format === "hours") {
    return formatHoursSpan(value, COMPACT_SPAN);
  }

  return formatMetricValue(metric, value, timeZone);
}
