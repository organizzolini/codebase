import { Skeleton } from "@codebase/presentation";

import { BAR_HEIGHTS } from "./calendar-skeleton.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The classes that lay out the stand-in.
 */
export interface SkeletonBarsProperties {
  className?: string;
}

// 🧩 Component

/**
 * Draws a row of bars of different heights, standing in for the Charts.
 */
export function SkeletonBars(
  properties: Readonly<SkeletonBarsProperties>,
): ReactNode {
  const { className } = properties;

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
    >
      {[...BAR_HEIGHTS, ...BAR_HEIGHTS].map((height, index) => (
        <Skeleton
          key={`bar-${String(index)}`}
          className={`${height} w-full`}
        />
      ))}
    </div>
  );
}
