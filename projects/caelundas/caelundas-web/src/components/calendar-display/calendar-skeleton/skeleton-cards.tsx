import { Skeleton } from "@codebase/presentation";

import { CARD_KEYS } from "./calendar-skeleton.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The classes that lay out the stand-in.
 */
export interface SkeletonCardsProperties {
  className?: string;
}

// 🧩 Component

/**
 * Draws a grid of cards, standing in for the Totals.
 */
export function SkeletonCards(
  properties: Readonly<SkeletonCardsProperties>,
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
      data-testid="skeleton-cards"
    >
      {CARD_KEYS.map((key) => (
        <Skeleton
          key={key}
          className="h-28"
        />
      ))}
    </div>
  );
}
