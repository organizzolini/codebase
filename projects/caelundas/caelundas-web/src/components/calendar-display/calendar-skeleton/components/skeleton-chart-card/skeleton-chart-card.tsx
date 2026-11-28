import { Skeleton } from "@codebase/presentation";

import { COLUMN_KEYS, RULES, TICK_KEYS } from "./skeleton-chart-card.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * Each column's height, as a share of the plot's.
 */
export interface SkeletonChartCardProperties {
  className?: string;
  columns: readonly number[];
}

// 🧩 Component

/**
 * Draws a chart: its icon, name and sort button, a note, and a plot of ruled columns of varied height with axis labels.
 */
export function SkeletonChartCard(
  properties: Readonly<SkeletonChartCardProperties>,
): ReactNode {
  const { className, columns } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={`flex min-w-0 flex-col gap-2 rounded-lg border p-3 ${className ?? ""}`}
      data-testid="skeleton-chart-card"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-6 items-center gap-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="size-6" />
      </div>
      <Skeleton className="-mt-1 h-4 w-2/3" />
      <div className="flex h-72 w-full">
        <div className="flex w-16 flex-col items-end justify-between pt-2 pr-2 pb-16">
          {TICK_KEYS.map((key) => (
            <Skeleton
              key={key}
              className="h-3 w-8"
            />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col pt-2 pr-2">
          <div className="relative min-h-0 flex-1">
            {RULES.map((top) => (
              <div
                key={top}
                className="absolute inset-x-0 border-t"
                style={{ top }}
              />
            ))}
            <div className="absolute inset-0 flex items-end">
              {columns.map((height, index) => (
                <div
                  key={COLUMN_KEYS[index]}
                  className="flex h-full min-w-0 flex-1 items-end justify-center"
                >
                  <Skeleton
                    className="w-3/4 rounded-sm"
                    data-testid="skeleton-chart-column"
                    style={{ height: `${String(height)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-16 items-start pt-2">
            {columns.map((_, index) => (
              <div
                key={COLUMN_KEYS[index]}
                className="flex flex-1 justify-center"
              >
                <Skeleton className="h-3 w-10 origin-top-right -rotate-35" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
