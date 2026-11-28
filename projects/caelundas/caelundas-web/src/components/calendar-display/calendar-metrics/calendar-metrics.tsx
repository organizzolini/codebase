import { useMetricCatalog } from "../../../hooks/use-metric-layout/hooks/use-metric-catalog/use-metric-catalog";
import { CalendarCharts } from "../calendar-charts/calendar-charts";
import { CalendarTotals } from "../calendar-totals/calendar-totals";

import { resolveMetrics } from "./calendar-metrics.utilities";
import { MetricsPending } from "./components/metrics-pending/metrics-pending";

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
   * The metric slugs to measure, first first; the layout's defaults when absent.
   */
  metrics?: readonly string[] | undefined;
  view: MetricViewName;
}

// 🧩 Component

/**
 * Renders the Charts or the Totals, the one the view names, over the same days, filter, grouping and metrics, once the catalog is read.
 */
export function CalendarMetrics(
  properties: Readonly<CalendarMetricsProperties>,
): ReactNode {
  const { className, compare = false, metrics, view, ...layout } = properties;

  // 🪝 Hooks
  const { catalog, error, retry, status } = useMetricCatalog();

  // 🏗 Setup
  const shared = {
    ...layout,
    className: "h-full",
    compare,
    metrics: resolveMetrics(catalog, view, metrics),
  };

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (status !== "ready") {
    return (
      <MetricsPending
        className={className}
        error={error}
        isLoading={status === "loading"}
        onRetry={retry}
        view={view}
      />
    );
  }

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
