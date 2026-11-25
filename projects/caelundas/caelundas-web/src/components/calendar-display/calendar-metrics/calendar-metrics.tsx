import { CalendarCharts } from "../calendar-charts/calendar-charts";
import { CalendarTotals } from "../calendar-totals/calendar-totals";

import { DEFAULT_METRICS } from "./calendar-metrics.constants";

import type { EventMetric } from "../../../graphql/generated/operations";
import type { MetricViewName } from "../events-calendar/components/calendar-views/calendar-views.types";
import type { MetricLayoutProperties } from "./calendar-metrics-layout.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A metric layout's properties, defaulting the metrics, and the layout to draw.
 */
export interface CalendarMetricsProperties extends Omit<
  MetricLayoutProperties,
  "compare" | "metrics"
> {
  className?: string;
  /**
   * Whether to also measure the period before; not when absent.
   */
  compare?: boolean | undefined;
  /**
   * The metrics to measure, first first; the layout's defaults when absent.
   */
  metrics?: readonly EventMetric[] | undefined;
  view: MetricViewName;
}

// 🧩 Component

/**
 * Renders the Charts or the Totals, the one the view names, over the same days, filter, grouping and metrics.
 */
export function CalendarMetrics(
  properties: Readonly<CalendarMetricsProperties>,
): ReactNode {
  const { className, compare = false, metrics, view, ...layout } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const shared = {
    ...layout,
    className: "h-full",
    compare,
    metrics: metrics ?? DEFAULT_METRICS[view],
  };

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-metrics"
    >
      {view === "charts" ? (
        <CalendarCharts {...shared} />
      ) : (
        <CalendarTotals {...shared} />
      )}
    </div>
  );
}
