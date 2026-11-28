import { formatMetricValue } from "../../calendar-metrics.utilities";
import { COMPACT_SPAN } from "../calendar-metrics-span/calendar-metrics-span.constants";
import { formatDurationSpan } from "../calendar-metrics-span/calendar-metrics-span.utilities";

import type { MetricDescriptor } from "../../calendar-metrics.types";

// 🌎 Public Functions

/**
 * A metric's number in little room: durations as abbreviated spans of three units, anything else as formatMetricValue writes it.
 */
export function formatMetricValueCompact(
  metric: Readonly<MetricDescriptor>,
  value: null | number,
  timeZone = "UTC",
): string {
  if (value !== null && metric.unit === "DURATION") {
    return formatDurationSpan(value, COMPACT_SPAN);
  }

  return formatMetricValue(metric, value, timeZone);
}
