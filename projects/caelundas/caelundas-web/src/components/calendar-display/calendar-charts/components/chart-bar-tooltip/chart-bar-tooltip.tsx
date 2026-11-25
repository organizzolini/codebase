import { ChartTooltipContent } from "@codebase/presentation";

import {
  findChartSegment,
  isMonochrome,
  limitTooltipRows,
} from "../../calendar-charts.utilities";
import { ChartTooltipHeading } from "../chart-tooltip-heading/chart-tooltip-heading";
import { ChartTooltipRow } from "../chart-tooltip-row/chart-tooltip-row";

import type { ChartBar } from "../../calendar-charts.types";
import type { ReactNode } from "react";
import type { TooltipContentProps } from "recharts";

// 🔖 Type

/**
 * What the chart hands its tooltip, plus its source bars.
 */
export interface ChartBarTooltipProperties {
  bars: readonly ChartBar[];
  tooltip: TooltipContentProps;
}

// 🧩 Component

/**
 * Renders the hovered group's label and change, then the first pieces of its bar with their values and shares, and the previous period's.
 */
export function ChartBarTooltip(
  properties: Readonly<ChartBarTooltipProperties>,
): ReactNode {
  const { bars, tooltip } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const bar = bars.find((candidate) => candidate.id === tooltip.label);
  const { hidden, shown } = limitTooltipRows(tooltip.payload);
  const plain = isMonochrome(bars);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (bar === undefined) {
    return null;
  }

  // 🎨 Markup
  return (
    <ChartTooltipContent
      active={tooltip.active}
      formatter={(_value, name) => (
        <ChartTooltipRow
          plain={plain}
          previousText={bar.previousText}
          segment={findChartSegment(bar, Number(name))}
        />
      )}
      label={tooltip.label}
      labelFormatter={() => (
        <ChartTooltipHeading
          bar={bar}
          hidden={hidden}
        />
      )}
      payload={shown}
    />
  );
}
