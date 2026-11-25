import { TagIcon } from "../../../../calendar-query/tag-icon/tag-icon";
import { METRIC_CATALOG } from "../../../calendar-metrics/calendar-metrics.constants";
import { ChartBarRow } from "../chart-bar-row/chart-bar-row";
import { ChartPlot } from "../chart-plot/chart-plot";
import { ChartSortButton } from "../chart-sort-button/chart-sort-button";

import type { EventMetric } from "../../../../../graphql/generated/operations";
import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { ChartBar } from "../../calendar-charts.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A metric, its bars, and how its sort button works.
 */
export interface MetricChartProperties {
  bars: readonly ChartBar[];
  metric: EventMetric;
  onOpen: (parent: string, id: string, color?: string) => void;
  /**
   * Cycles the sort by the metric; the sort button is absent without it.
   */
  onSort?: (() => void) | undefined;
  onToggle: (id: string, color?: string) => void;
  sortDirection?: GroupSort["direction"] | undefined;
}

// 🧩 Component

/**
 * Renders a metric's chart: its icon, name and sort button, a column per group, and the groups as buttons.
 */
export function MetricChart(
  properties: Readonly<MetricChartProperties>,
): ReactNode {
  const { bars, metric, onOpen, onSort, onToggle, sortDirection } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { description, icon, label } = METRIC_CATALOG[metric];

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section
      aria-label={label}
      className="flex min-w-0 flex-col gap-2 rounded-lg border p-3"
      data-testid="metric-chart"
    >
      <header className="flex items-center justify-between gap-2">
        <h3
          className="flex min-w-0 items-center gap-2 font-medium"
          title={description}
        >
          <TagIcon name={icon} />
          <span className="truncate">{label}</span>
        </h3>
        {onSort === undefined ? null : (
          <ChartSortButton
            direction={sortDirection}
            label={label}
            onClick={onSort}
          />
        )}
      </header>
      <ChartPlot
        bars={bars}
        metric={metric}
        onOpen={onOpen}
        onToggle={onToggle}
      />
      <ul className="sr-only focus-within:not-sr-only focus-within:flex focus-within:flex-wrap focus-within:gap-1">
        {bars.map((bar) => (
          <ChartBarRow
            key={bar.id}
            bar={bar}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </section>
  );
}
