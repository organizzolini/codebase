import { useSyncExternalStore } from "react";

import { Skeleton } from "@codebase/presentation";

import {
  isWideViewport,
  subscribeToViewport,
} from "../lib/calendar/calendar-viewport";

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
const ROW_KEYS = Array.from(
  { length: 8 },
  (_, index) => `row-${String(index)}`,
);

/**
 * Renders the shape of the view the page opens on, a toolbar row over a grid
 * of days on a wide page, or over the agenda's list of events on a phone,
 * while the events database loads.
 */
export function CalendarSkeleton(
  properties: Readonly<CalendarSkeletonProperties>,
): ReactNode {
  const { className } = properties;

  // 🪝 Hooks
  // The skeleton is the pending component, so the build's shell page renders
  // it with no window to measure; it is drawn wide there, and settles on the
  // real width once it hydrates.
  const isWide = useSyncExternalStore(
    subscribeToViewport,
    isWideViewport,
    isWideOnServer,
  );

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
        data-layout={isWide ? "grid" : "list"}
        role="status"
      >
        <Skeleton className="h-8 w-64 max-w-full" />
        {isWide ? (
          <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1">
            {CELL_KEYS.map((key) => (
              <Skeleton key={key} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            {ROW_KEYS.map((key) => (
              <Skeleton
                key={key}
                className="h-14 shrink-0"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The width assumed where there is no window to ask.
 */
function isWideOnServer(): boolean {
  return true;
}
