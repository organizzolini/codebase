import { Skeleton } from "@codebase/presentation";

import {
  CELL_KEYS,
  COLUMN_COUNTS,
  EVENT_HEIGHTS,
  ROW_KEYS,
  TIMELINE_BARS,
} from "./calendar-skeleton.constants";

import type { CalendarViewName } from "../events-calendar/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view whose body the skeleton stands in for.
 */
export interface SkeletonBodyProperties {
  className?: string;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Draws the body of the skeleton for one view.
 */
export function SkeletonBody(
  properties: Readonly<SkeletonBodyProperties>,
): ReactNode {
  const { className, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  let content: ReactNode;

  switch (view) {
    case "agenda": {
      content = (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {ROW_KEYS.map((key) => (
            <Skeleton
              key={key}
              className="h-14 shrink-0"
            />
          ))}
        </div>
      );

      break;
    }
    case "month": {
      content = (
        <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1">
          {CELL_KEYS.map((key) => (
            <Skeleton key={key} />
          ))}
        </div>
      );

      break;
    }
    case "timeline": {
      content = (
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

      break;
    }
    case "day":
    case "three-day":
    case "week": {
      const count = COLUMN_COUNTS[view];

      content = (
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
  }

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="skeleton-body"
      style={{ display: "contents" }}
    >
      {content}
    </div>
  );
}
