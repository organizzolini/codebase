import { CARD_KEYS, REDUCED_MOTION } from "./calendar-skeleton.constants";
import { SkeletonTotalCard } from "./components/skeleton-total-card/skeleton-total-card";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The wrapper's classes and the id of its announcement.
 */
export interface SkeletonCardsProperties {
  className?: string;
  /**
   * The id of the announcement, for a container to name itself by.
   */
  labelId?: string | undefined;
}

// 🧩 Component

/**
 * Draws the Totals' grid of cards, in as many columns as the page is wide enough for.
 */
export function SkeletonCards(
  properties: Readonly<SkeletonCardsProperties>,
): ReactNode {
  const { className, labelId } = properties;

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
      style={{ display: "contents" }}
    >
      <div
        aria-hidden="true"
        className={`grid grid-cols-1 gap-4 overflow-hidden p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ${REDUCED_MOTION}`}
      >
        {CARD_KEYS.map((key) => (
          <SkeletonTotalCard key={key} />
        ))}
      </div>
      <span
        className="sr-only"
        id={labelId}
      >
        Loading totals
      </span>
    </div>
  );
}
