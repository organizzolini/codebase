import { Skeleton } from "@codebase/presentation";

import { REDUCED_MOTION } from "../../calendar-skeleton.constants";

import { CELLS, WEEKDAY_KEYS } from "./skeleton-month.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The classes that lay out the stand-in.
 */
export interface SkeletonMonthProperties {
  className?: string;
}

// 🧩 Component

/**
 * Draws the month's weekday heads over six weeks of ruled days, each holding event bars and a day number.
 */
export function SkeletonMonth(
  properties: Readonly<SkeletonMonthProperties>,
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
      className={`flex min-h-0 flex-1 flex-col ${REDUCED_MOTION} ${className ?? ""}`}
      data-testid="skeleton-month"
    >
      <div className="grid h-8 shrink-0 grid-cols-7 items-center border-b px-2">
        {WEEKDAY_KEYS.map((key) => (
          <Skeleton
            key={key}
            className="h-3 w-8"
          />
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {CELLS.map(({ bars, id }) => (
          <div
            key={id}
            className="flex min-w-0 flex-col gap-1 overflow-hidden border-e border-b p-1"
            data-testid="skeleton-month-day"
          >
            {bars.map(({ key, width }) => (
              <Skeleton
                key={key}
                className={`h-5 shrink-0 ${width}`}
              />
            ))}
            <Skeleton className="mt-auto size-5 shrink-0 self-end rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
