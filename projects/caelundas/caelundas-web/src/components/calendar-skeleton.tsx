import { Skeleton } from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The skeleton takes only a class name.
 */
export interface CalendarSkeletonProperties {
  className?: string;
}

// 🧩 Component

const WEEKS = 6;
const DAYS_PER_WEEK = 7;
const CELL_KEYS = Array.from(
  { length: WEEKS * DAYS_PER_WEEK },
  (_, index) => `cell-${String(index)}`,
);

/**
 * Renders the month view's shape, a toolbar row over a grid of days, while
 * the events database loads.
 */
export function CalendarSkeleton(
  properties: Readonly<CalendarSkeletonProperties>,
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
      data-testid="calendar-skeleton"
    >
      <div
        aria-busy="true"
        aria-label="Loading events"
        className="flex h-dvh flex-col gap-2 p-2"
        role="status"
      >
        <Skeleton className="h-8 w-64" />
        <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1">
          {CELL_KEYS.map((key) => (
            <Skeleton key={key} />
          ))}
        </div>
      </div>
    </div>
  );
}
