import { Children, useEffect, useState } from "react";

import { useBreakpoint } from "@codebase/presentation";

import { keyOf } from "./masonry.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties Masonry accepts.
 */
export interface MasonryProperties {
  /** The cards, each with a key, dealt across the columns. */
  children?: ReactNode;
  className?: string;
}

// 🧩 Component

/**
 * Cards in columns of their own, so none leaves a gap beside a taller one. Cards are dealt round-robin, so the first sit side by side.
 */
export function Masonry(properties: Readonly<MasonryProperties>): ReactNode {
  const { children, className } = properties;

  // 🪝 Hooks
  const { is2xl, isLg, isMd } = useBreakpoint();
  const [isMeasured, setIsMeasured] = useState(false);

  // 🏗 Setup
  // One column on a phone, then a column more at the md, lg, and 2xl
  // breakpoints. The fourth waits for 2xl (1536px) so that a 14-inch laptop,
  // which is 1512px wide, gets three columns wide enough for a forms table.
  const columnCount = [true, isMd, isLg, is2xl].filter(Boolean).length;
  const cards = Children.toArray(children);
  const columns = Array.from({ length: columnCount }, (_, column) =>
    cards.filter((_card, index) => index % columnCount === column),
  );

  // 💪 Handlers

  // ♻️ Lifecycle
  // The server renders one column, and breakpoints settle only after hydration.
  // Cards stay invisible until then so the stacked layout never flashes.
  useEffect(() => {
    setIsMeasured(true);
  }, []);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="masonry"
    >
      <div
        className={`flex items-start gap-4 ${isMeasured ? "" : "invisible"}`}
      >
        {columns.map((column) => (
          <div
            key={column.map((card) => keyOf(card)).join(",")}
            className="flex min-w-0 flex-1 flex-col gap-4"
            data-testid="masonry-column"
          >
            {column}
          </div>
        ))}
      </div>
    </div>
  );
}
