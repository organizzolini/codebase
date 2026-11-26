import {
  CHART_COLUMNS,
  CHART_KEYS,
  REDUCED_MOTION,
} from "./calendar-skeleton.constants";
import { SkeletonChartCard } from "./components/skeleton-chart-card/skeleton-chart-card";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The wrapper's classes and the id of its announcement.
 */
export interface SkeletonBarsProperties {
  className?: string;
  /**
   * The id of the announcement, for a container to name itself by.
   */
  labelId?: string | undefined;
}

// 🧩 Component

/**
 * Draws the Charts' grid of chart cards, two across a wide page and one on a narrow one.
 */
export function SkeletonBars(
  properties: Readonly<SkeletonBarsProperties>,
): ReactNode {
  const { className, labelId } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="skeleton-bars"
      style={{ display: "contents" }}
    >
      <div
        aria-hidden="true"
        className={`grid h-full grid-cols-1 content-start gap-4 overflow-hidden p-4 lg:grid-cols-2 ${REDUCED_MOTION}`}
      >
        {CHART_COLUMNS.map((columns, index) => (
          <SkeletonChartCard
            key={CHART_KEYS[index]}
            columns={columns}
          />
        ))}
      </div>
      <span
        className="sr-only"
        id={labelId}
      >
        Loading charts
      </span>
    </div>
  );
}
