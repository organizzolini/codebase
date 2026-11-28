import { Skeleton } from "@codebase/presentation";

import {
  SUBTOTAL_KEYS,
  SUBTOTAL_LABELS,
} from "./skeleton-total-card.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The classes that lay out the stand-in.
 */
export interface SkeletonTotalCardProperties {
  className?: string;
}

// 🧩 Component

/**
 * Draws a Totals card: its icon and name, a large value, a note, and a bordered subtotal for each group with a share bar.
 */
export function SkeletonTotalCard(
  properties: Readonly<SkeletonTotalCardProperties>,
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
      className={`bg-card flex flex-col gap-3 rounded-lg border p-4 ${className ?? ""}`}
      data-testid="skeleton-total-card"
    >
      <div className="flex h-5 items-center gap-2">
        <Skeleton className="size-4" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-9 w-24" />
      <Skeleton className="-mt-2 h-4 w-3/4" />
      <div className="@container flex flex-col gap-1.5">
        <div className="grid grid-cols-1 gap-2 @sm:grid-cols-2">
          {SUBTOTAL_LABELS.map((label, index) => (
            <div
              key={SUBTOTAL_KEYS[index]}
              className="bg-background/60 flex flex-col gap-1.5 rounded-md border p-2"
              data-testid="skeleton-subtotal"
            >
              <div className="flex h-5 items-center gap-2">
                <Skeleton className="size-3.5 shrink-0" />
                <Skeleton className="size-2.5 shrink-0 rounded-full" />
                <Skeleton className={`h-4 ${label}`} />
                <span className="flex-1" />
                <Skeleton className="h-4 w-8 shrink-0" />
              </div>
              <Skeleton className="h-1 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
