import { Skeleton } from "@codebase/presentation";

import { REDUCED_MOTION } from "../../calendar-skeleton.constants";

import {
  INDENT_REM,
  TABLE_COLUMNS,
  TABLE_HEADS,
  TABLE_ROWS,
} from "./skeleton-table.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The classes that lay out the stand-in.
 */
export interface SkeletonTableProperties {
  className?: string;
}

// 🧩 Component

/**
 * Draws column heads, then group rows with count pills and event rows with name and time pills.
 */
export function SkeletonTable(
  properties: Readonly<SkeletonTableProperties>,
): ReactNode {
  const { className } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const row = `grid ${TABLE_COLUMNS} items-center border-b px-0`;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden border-t ${REDUCED_MOTION} ${className ?? ""}`}
      data-testid="skeleton-table"
    >
      <div className="w-full min-w-[64rem]">
        <div
          className={`${row} h-10`}
          data-testid="skeleton-table-heads"
        >
          {TABLE_HEADS.map((width) => (
            <div
              key={width}
              className="px-2"
            >
              <Skeleton className={`h-6.5 ${width}`} />
            </div>
          ))}
        </div>
        {TABLE_ROWS.map((entry) =>
          entry.kind === "group" ? (
            <div
              key={entry.id}
              className={`${row} h-9`}
              data-testid="skeleton-table-group"
            >
              <div className="px-2">
                <Skeleton
                  className={`h-7.5 ${entry.width}`}
                  style={{
                    marginLeft: `${String(entry.depth * INDENT_REM)}rem`,
                  }}
                />
              </div>
              <div className="px-2">
                <Skeleton className="h-5.5 w-21" />
              </div>
              <div className="px-2">
                <Skeleton className="h-5.5 w-21" />
              </div>
              <div className="px-2">
                <Skeleton className="h-5.5 w-21" />
              </div>
            </div>
          ) : (
            <div
              key={entry.id}
              className={`${row} h-10.75`}
              data-testid="skeleton-table-event"
            >
              <div />
              <div className="px-2">
                <Skeleton className={`h-6.5 ${entry.width}`} />
              </div>
              <div className="px-2">
                <Skeleton className="h-6.5 w-40" />
              </div>
              <div className="px-2">
                <Skeleton className="h-6.5 w-40" />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
