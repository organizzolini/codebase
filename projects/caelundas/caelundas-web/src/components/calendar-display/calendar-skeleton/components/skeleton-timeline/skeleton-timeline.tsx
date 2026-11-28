import { Skeleton } from "@codebase/presentation";

import { REDUCED_MOTION } from "../../calendar-skeleton.constants";

import {
  INDENT_REM,
  SCALE_KEYS,
  TIMELINE_ROWS,
} from "./skeleton-timeline.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The classes that lay out the stand-in.
 */
export interface SkeletonTimelineProperties {
  className?: string;
}

// 🧩 Component

/**
 * Draws the timeline's list of groups with their counts beside a time scale and a bar on each row.
 */
export function SkeletonTimeline(
  properties: Readonly<SkeletonTimelineProperties>,
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
      className={`flex min-h-0 flex-1 overflow-hidden border-t ${REDUCED_MOTION} ${className ?? ""}`}
      data-testid="skeleton-timeline"
    >
      <div className="w-40 shrink-0 border-e sm:w-80">
        <div className="flex h-16 items-end justify-between border-b px-2 pb-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-10" />
        </div>
        {TIMELINE_ROWS.map(({ depth, id, width }) => (
          <div
            key={id}
            className="flex h-11 items-center justify-between gap-2 border-b px-2"
            data-testid="skeleton-timeline-group"
          >
            <Skeleton
              className={`h-7 ${width}`}
              style={{ marginLeft: `${String(depth * INDENT_REM)}rem` }}
            />
            <Skeleton className="h-4 w-8 shrink-0" />
          </div>
        ))}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex h-16 flex-col justify-between border-b px-2 py-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-4 overflow-hidden">
            {SCALE_KEYS.map((key) => (
              <Skeleton
                key={key}
                className="h-4 w-12 shrink-0"
              />
            ))}
          </div>
        </div>
        {TIMELINE_ROWS.map(({ bar, id }) => (
          <div
            key={id}
            className="flex h-11 items-center border-b"
            data-testid="skeleton-timeline-row"
          >
            <Skeleton className={`h-7 ${bar}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
