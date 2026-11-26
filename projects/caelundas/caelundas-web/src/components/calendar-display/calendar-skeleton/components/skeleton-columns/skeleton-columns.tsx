import { Skeleton } from "@codebase/presentation";

import { REDUCED_MOTION } from "../../calendar-skeleton.constants";
import { listKeys } from "../../calendar-skeleton.utilities";

import { DAY_SLOTS, HOUR_KEYS, HOUR_REM } from "./skeleton-columns.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * How many days stand side by side.
 */
export interface SkeletonColumnsProperties {
  className?: string;
  count: number;
}

// 🧩 Component

/**
 * Draws a column for each day: its head, an all-day bar, and events down ruled hours, beside a gutter of hour labels.
 */
export function SkeletonColumns(
  properties: Readonly<SkeletonColumnsProperties>,
): ReactNode {
  const { className, count } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const days = listKeys("day", count);
  const template = {
    gridTemplateColumns: `3rem repeat(${String(count)}, minmax(0, 1fr))`,
  };

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${REDUCED_MOTION} ${className ?? ""}`}
      data-testid="skeleton-columns"
    >
      <div
        className="grid h-8 shrink-0 items-center border-b"
        style={template}
      >
        <div />
        {days.map((day) => (
          <Skeleton
            key={day}
            className="mx-2 h-3 w-14"
          />
        ))}
      </div>
      <div
        className="grid h-12 shrink-0 items-center border-b"
        style={template}
      >
        <Skeleton className="mx-auto h-5 w-8" />
        {days.map((day) => (
          <Skeleton
            key={day}
            className="mx-1 h-5"
          />
        ))}
      </div>
      <div
        className="grid min-h-0 flex-1 overflow-hidden"
        style={template}
      >
        <div>
          {HOUR_KEYS.map((hour) => (
            <div
              key={hour}
              className="flex items-start justify-center"
              style={{ height: `${String(HOUR_REM)}rem` }}
            >
              <Skeleton className="h-3 w-9" />
            </div>
          ))}
        </div>
        {days.map((day, column) => (
          <div
            key={day}
            className="relative border-s"
            data-testid="skeleton-column"
          >
            {HOUR_KEYS.map((hour) => (
              <div
                key={hour}
                className="border-b"
                style={{ height: `${String(HOUR_REM)}rem` }}
              />
            ))}
            {(DAY_SLOTS[column % DAY_SLOTS.length] ?? []).map((slot) => (
              <Skeleton
                key={slot.start}
                className="absolute inset-x-1"
                style={{
                  height: `${String(slot.hours * HOUR_REM)}rem`,
                  top: `${String(slot.start * HOUR_REM)}rem`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
