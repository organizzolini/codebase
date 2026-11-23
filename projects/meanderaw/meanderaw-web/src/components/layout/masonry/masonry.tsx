import { Children } from "react";

import { CARD_CLASS } from "./masonry.constants";
import { dealColumns, keyOf } from "./masonry.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The cards, each with a key, and the column count.
 */
export interface MasonryProperties {
  children?: ReactNode;
  className?: string;
  columns: number;
}

// 🧩 Component

/**
 * Renders cards in columns of their own, so none leaves a gap beside a taller one; dealt round-robin, they read left to right.
 */
export function Masonry(properties: Readonly<MasonryProperties>): ReactNode {
  const { children, className, columns } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const dealt = dealColumns(Children.toArray(children), columns);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="masonry"
    >
      <div className="flex items-start gap-4">
        {dealt.map((column) => (
          <div
            key={column.map((card) => keyOf(card)).join(",")}
            className="flex min-w-0 flex-1 flex-col gap-4"
            data-testid="masonry-column"
          >
            {column.map((card) => (
              <div
                key={keyOf(card)}
                className={CARD_CLASS}
              >
                {card}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
