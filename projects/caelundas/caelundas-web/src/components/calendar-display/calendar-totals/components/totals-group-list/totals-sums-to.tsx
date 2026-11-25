import { Sigma } from "lucide-react";

import {
  formatMetricValue,
  isAdditiveMetric,
} from "../../../calendar-metrics/calendar-metrics.utilities";
import { formatMetricValueCompact } from "../../../calendar-metrics/components/calendar-metrics-compact/calendar-metrics-compact.utilities";

import type { EventMetric } from "../../../../../graphql/generated/operations";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A metric, the value its groups make up, and the zone.
 */
export interface TotalsSumsToProperties {
  metric: EventMetric;
  timeZone?: string | undefined;
  whole: null | number;
}

// 🧩 Component

/**
 * Renders what the cards below sum to, with its full value as a title; nothing for a metric that does not add up.
 */
export function TotalsSumsTo(
  properties: Readonly<TotalsSumsToProperties>,
): ReactNode {
  const { metric, timeZone, whole } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (whole === null || !isAdditiveMetric(metric)) {
    return null;
  }

  // 🎨 Markup
  return (
    <p
      className="text-muted-foreground flex items-center gap-1 text-xs"
      data-testid="totals-sums-to"
      title={formatMetricValue(metric, whole, timeZone)}
    >
      <Sigma
        aria-hidden="true"
        className="size-3"
      />
      sums to {formatMetricValueCompact(metric, whole, timeZone)}
    </p>
  );
}
