import { useMemo } from "react";

import { useMetricCatalog } from "../../../hooks/use-metric-layout/hooks/use-metric-catalog/use-metric-catalog";
import { useMetricLayout } from "../../../hooks/use-metric-layout/use-metric-layout";
import { listChartMetrics } from "../calendar-metrics/calendar-metrics.utilities";
import { formatMetricValueCompact } from "../calendar-metrics/components/calendar-metrics-compact/calendar-metrics-compact.utilities";

import {
  buildChartBars,
  colorMetricGroups,
  cycleMetricSort,
  findChartsNotice,
  findMetricSortDirection,
} from "./calendar-charts.utilities";
import { ChartsNotice } from "./components/charts-notice/charts-notice";
import { MetricChart } from "./components/metric-chart/metric-chart";

import type { MetricLayoutProperties } from "../calendar-metrics/calendar-metrics-layout.types";
import type { MetricDescriptor } from "../calendar-metrics/calendar-metrics.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The metrics' options, sorts, toolbar hooks and group colors the layout gets.
 */
export interface CalendarChartsProperties extends MetricLayoutProperties {
  className?: string;
}

// 🧩 Component

/**
 * Renders a bar chart per metric: a bar per group shown, stacked by subgroup where the metric adds up.
 */
export function CalendarCharts(
  properties: Readonly<CalendarChartsProperties>,
): ReactNode {
  const { className, compare, groupColors, onSortChange, sort } = properties;

  // 🪝 Hooks
  const { catalog } = useMetricCatalog();
  // Dates cannot be charted, so a link that names them draws the rest.
  const metrics = useMemo(
    () => listChartMetrics(catalog, properties.metrics),
    [catalog, properties.metrics],
  );
  const layout = useMetricLayout({
    ...properties,
    metrics,
    rootsUntilTouched: true,
  });
  const { colorGroups, data, error, open, refetch, rows, status, toggle } =
    layout;
  const colors = useMemo(
    () => colorMetricGroups(colorGroups, groupColors),
    [colorGroups, groupColors],
  );

  // 🏗 Setup
  const notice = findChartsNotice(layout);
  const timeZone = data?.timezone ?? properties.timeZone;
  const charts: ReactNode[] = [];
  const format = (metric: MetricDescriptor, value: null | number): string =>
    formatMetricValueCompact(metric, value, timeZone);

  // A loop rather than a map keeps the call stack shallow.
  for (const slug of metrics) {
    const metric = catalog.bySlug.get(slug);

    if (metric !== undefined) {
      charts.push(
        <MetricChart
          key={slug}
          bars={buildChartBars(rows, metric, { colors, compare, format })}
          metric={metric}
          onOpen={open}
          onSort={
            onSortChange === undefined
              ? undefined
              : () => {
                  onSortChange(cycleMetricSort(sort, slug));
                }
          }
          onToggle={toggle}
          sortDirection={findMetricSortDirection(sort, slug)}
        />,
      );
    }
  }

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      aria-busy={status === "loading"}
      className={className}
      data-testid="calendar-charts"
    >
      {notice === undefined ? (
        <div className="grid h-full grid-cols-1 content-start gap-4 overflow-y-auto p-4 lg:grid-cols-2">
          {charts}
        </div>
      ) : (
        <ChartsNotice
          error={error}
          kind={notice}
          onRetry={refetch}
        />
      )}
    </div>
  );
}
