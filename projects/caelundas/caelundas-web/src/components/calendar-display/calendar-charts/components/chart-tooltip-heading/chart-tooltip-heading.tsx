import type { ChartBar } from "../../calendar-charts.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The hovered bar, and how many pieces the tooltip omits.
 */
export interface ChartTooltipHeadingProperties {
  bar: ChartBar;
  hidden: number;
}

// 🧩 Component

/**
 * Renders the group's label, its change against the previous period when compared, and how many pieces are not listed.
 */
export function ChartTooltipHeading(
  properties: Readonly<ChartTooltipHeadingProperties>,
): ReactNode {
  const { bar, hidden } = properties;
  const { change } = bar;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <>
      <span className="block">{bar.label}</span>
      {change === undefined ? null : (
        <span
          className="text-muted-foreground block font-normal"
          data-testid="chart-tooltip-change"
        >
          {change.percentText === ""
            ? change.text
            : `${change.text} (${change.percentText})`}
        </span>
      )}
      {hidden === 0 ? null : (
        <span className="text-muted-foreground block font-normal">
          {`${String(hidden)} more not listed`}
        </span>
      )}
    </>
  );
}
