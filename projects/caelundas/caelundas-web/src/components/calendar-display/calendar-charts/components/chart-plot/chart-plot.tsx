import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, ChartTooltip } from "@codebase/presentation";

import {
  buildChartAxis,
  findChartMaximum,
  formatChartTick,
} from "../../calendar-charts-axis.utilities";
import { PREVIOUS_SERIES } from "../../calendar-charts.constants";
import {
  findChartSegment,
  findPreviousPaint,
  findSeriesPaint,
  isMonochrome,
  listChartSeries,
  truncateChartLabel,
} from "../../calendar-charts.utilities";
import { ChartBarTooltip } from "../chart-bar-tooltip/chart-bar-tooltip";

import type { MetricDescriptor } from "../../../calendar-metrics/calendar-metrics.types";
import type { ChartBar } from "../../calendar-charts.types";
import type { ChartConfig } from "@codebase/presentation";
import type { ReactNode } from "react";
import type { BarShapeProps } from "recharts";

// 🔖 Type

/**
 * A metric's bars, drawn as columns, and their click handler.
 */
export interface ChartPlotProperties {
  bars: readonly ChartBar[];
  metric: MetricDescriptor;
  /**
   * Opens a piece's group, with the bar's group above it, in the piece's color.
   */
  onOpen: (parent: string, id: string, color?: string) => void;
  onToggle: (id: string, color?: string) => void;
}

// 🧩 Component

/**
 * Renders a column for each group, stacked by its subgroups where the metric adds up, with the previous period's beside it and a tooltip.
 */
export function ChartPlot(
  properties: Readonly<ChartPlotProperties>,
): ReactNode {
  const { bars, metric, onOpen, onToggle } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const config: ChartConfig = {};
  const series = listChartSeries(bars);
  const isCompared = bars.some((bar) => bar.previous !== null);
  const axis = buildChartAxis(metric, findChartMaximum(bars));
  const plain = isMonochrome(bars);

  // 💪 Handlers
  // A piece with subgroups opens into them; any other click opens or closes the bar's own group.
  const handleClick = (index: number, position?: number): void => {
    const bar = bars[index];

    if (bar === undefined) {
      return;
    }

    const segment = findChartSegment(bar, position);

    if (segment?.isExpandable === true && segment.id !== bar.id) {
      onOpen(bar.id, segment.id, segment.color);
    } else if (bar.target !== undefined) {
      onToggle(bar.target, bar.color);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <ChartContainer
      className="aspect-auto h-72 w-full"
      config={config}
    >
      <BarChart
        data={[...bars]}
        margin={{ bottom: 0, left: 0, right: 8, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          angle={-35}
          axisLine={false}
          dataKey="id"
          height={64}
          interval="equidistantPreserveStart"
          textAnchor="end"
          tickFormatter={(_id: unknown, index: number) =>
            truncateChartLabel(bars[index]?.label)
          }
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          domain={axis.domain}
          tickFormatter={(value: number) =>
            formatChartTick(metric, value, axis.unit)
          }
          tickLine={false}
          width={64}
          {...(axis.ticks === undefined ? {} : { ticks: axis.ticks })}
        />
        <ChartTooltip
          content={(tooltip) => (
            <ChartBarTooltip
              bars={bars}
              tooltip={tooltip}
            />
          )}
        />
        {series.map((position) => (
          <Bar
            key={position}
            className="cursor-pointer"
            dataKey={(bar: ChartBar) => findChartSegment(bar, position)?.value}
            name={String(position)}
            onClick={(_data: unknown, index: number) => {
              handleClick(index, position);
            }}
            radius={2}
            shape={(shape: BarShapeProps) => (
              <Rectangle
                {...shape}
                {...findSeriesPaint(
                  bars[shape.index]?.segments[position]?.color,
                  plain,
                )}
              />
            )}
            stackId="current"
          />
        ))}
        {isCompared ? (
          <Bar
            dataKey="previous"
            name={PREVIOUS_SERIES}
            onClick={(_data: unknown, index: number) => {
              handleClick(index);
            }}
            radius={2}
            stackId="previous"
            strokeDasharray="4 2"
            {...findPreviousPaint(plain)}
          />
        ) : null}
      </BarChart>
    </ChartContainer>
  );
}
