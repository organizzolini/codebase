import {
  DEFAULT_FILL,
  MONOCHROME_FILL,
  MONOCHROME_STROKE,
} from "../../calendar-charts.constants";

import type { ChartSegment } from "../../calendar-charts.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A piece of a bar, or the previous period's value.
 */
export interface ChartTooltipRowProperties {
  /**
   * Whether the swatch is black with a white border, as when colors are off.
   */
  plain?: boolean;
  previousText: string;
  segment: ChartSegment | undefined;
}

// 🧩 Component

/**
 * Renders one line of a tooltip: a swatch in the piece's color, its label, and its value with its share.
 */
export function ChartTooltipRow(
  properties: Readonly<ChartTooltipRowProperties>,
): ReactNode {
  const { plain = false, previousText, segment } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (segment === undefined) {
    return (
      <>
        <span className="size-2.5 shrink-0 rounded-[2px] border border-dashed" />
        <span className="text-muted-foreground">Previous period</span>
        <span className="ml-auto font-mono font-medium tabular-nums">
          {previousText}
        </span>
      </>
    );
  }

  // 🎨 Markup
  return (
    <>
      <span
        className="size-2.5 shrink-0 rounded-[2px]"
        style={
          plain
            ? {
                backgroundColor: MONOCHROME_FILL,
                border: `1px solid ${MONOCHROME_STROKE}`,
              }
            : { backgroundColor: segment.color ?? DEFAULT_FILL }
        }
      />
      <span className="text-muted-foreground">{segment.label}</span>
      <span className="ml-auto font-mono font-medium tabular-nums">
        {segment.share === ""
          ? segment.text
          : `${segment.text} (${segment.share})`}
      </span>
    </>
  );
}
