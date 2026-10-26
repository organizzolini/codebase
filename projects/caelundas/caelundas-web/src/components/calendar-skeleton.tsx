import { useSyncExternalStore } from "react";

import { Skeleton } from "@codebase/presentation";

import {
  isWideViewport,
  subscribeToViewport,
} from "../lib/calendar/calendar-viewport";
import {
  type CalendarViewName,
  getDefaultCalendarView,
} from "../lib/calendar/calendar-views";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The skeleton takes a class name and the view it stands in for; without a
 * view it stands in for the one the page opens on at the width it has.
 */
export interface CalendarSkeletonProperties {
  className?: string;
  view?: CalendarViewName | undefined;
}

// 🧩 Component

const WEEKS = 6;
const DAYS_PER_WEEK = 7;
const COLUMN_COUNTS = { day: 1, "three-day": 3, week: DAYS_PER_WEEK } as const;
const CELL_KEYS = Array.from(
  { length: WEEKS * DAYS_PER_WEEK },
  (_, index) => `cell-${String(index)}`,
);
const ROW_KEYS = Array.from(
  { length: 8 },
  (_, index) => `row-${String(index)}`,
);
const TIMELINE_BARS = [
  "w-1/3 ms-[5%]",
  "w-1/4 ms-[30%]",
  "w-2/5 ms-[10%]",
  "w-1/5 ms-[55%]",
  "w-1/3 ms-[20%]",
  "w-1/4 ms-[45%]",
  "w-1/2 ms-[8%]",
  "w-1/5 ms-[65%]",
] as const;
const EVENT_HEIGHTS = ["h-8", "h-12", "h-8", "h-16", "h-8"] as const;

/**
 * Renders the shape of the view the page opens on, a toolbar row over that
 * view's layout: a grid of days for the month, columns of hours for the week,
 * three days or one, the agenda's list, or the timeline's bars on rows, while
 * the events database loads.
 */
export function CalendarSkeleton(
  properties: Readonly<CalendarSkeletonProperties>,
): ReactNode {
  const { className, view } = properties;

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
  const shown = view ?? getDefaultCalendarView(isWide);

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
        data-layout={LAYOUTS[shown]}
        data-view={shown}
        role="status"
      >
        <div className="flex flex-wrap items-start gap-2">
          <Skeleton className="h-7 w-48 max-w-full" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-72 max-w-full" />
          <Skeleton className="h-7 w-36" />
        </div>
        <SkeletonBody view={shown} />
      </div>
    </div>
  );
}

/**
 * The layout each view's skeleton takes: a grid for the month, columns for
 * the views of hours, a list for the agenda, bars for the timeline.
 */
const LAYOUTS: Readonly<
  Record<CalendarViewName, "columns" | "grid" | "list" | "timeline">
> = {
  agenda: "list",
  day: "columns",
  month: "grid",
  "three-day": "columns",
  timeline: "timeline",
  week: "columns",
};

/**
 * The width assumed where there is no window to ask.
 */
function isWideOnServer(): boolean {
  return true;
}

/**
 * Draws the body of the skeleton for one view.
 */
function SkeletonBody(
  properties: Readonly<{ view: CalendarViewName }>,
): ReactNode {
  const { view } = properties;

  if (view === "month") {
    return (
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1">
        {CELL_KEYS.map((key) => (
          <Skeleton key={key} />
        ))}
      </div>
    );
  }

  if (view === "agenda") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {ROW_KEYS.map((key) => (
          <Skeleton
            key={key}
            className="h-14 shrink-0"
          />
        ))}
      </div>
    );
  }

  if (view === "timeline") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {TIMELINE_BARS.map((bar) => (
          <div
            key={bar}
            className="flex items-center gap-2"
          >
            <Skeleton className="h-6 w-24 shrink-0" />
            <Skeleton className={`h-6 ${bar}`} />
          </div>
        ))}
      </div>
    );
  }

  const count = COLUMN_COUNTS[view];

  return (
    <div
      className="grid min-h-0 flex-1 gap-1"
      style={{ gridTemplateColumns: `3rem repeat(${String(count)}, 1fr)` }}
    >
      <Skeleton className="row-span-1 h-full" />
      {Array.from({ length: count }, (_, column) => (
        <div
          key={`column-${String(column)}`}
          className="flex flex-col gap-2"
        >
          <Skeleton className="h-6 shrink-0" />
          {EVENT_HEIGHTS.map((height, index) => (
            <Skeleton
              key={`event-${String(column)}-${String(index)}`}
              className={`${height} shrink-0`}
            />
          ))}
          <Skeleton className="min-h-0 flex-1" />
        </div>
      ))}
    </div>
  );
}
