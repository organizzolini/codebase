import { GalleryError } from "../gallery-error/gallery-error";
import { MeanderCard } from "../meander-card/meander-card";

import { HEADINGS } from "./grouped-item.constants";

import type { GalleryView } from "../../hooks/use-gallery-search/use-gallery-search.types";
import type {
  GroupedItem as GroupedRow,
  GroupLeaf,
} from "../grouped-gallery/grouped-gallery.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The row, its card columns, and how to retry a failure.
 */
export interface GroupedItemProperties {
  className?: string;
  columns: number;
  item: GroupedRow;
  onRetry: (leaf: GroupLeaf) => void;
  view: GalleryView;
}

// 🧩 Component

/**
 * Renders one row of the grouped list: a header, cards, or a status.
 */
export function GroupedItem(
  properties: Readonly<GroupedItemProperties>,
): ReactNode {
  const { className, columns, item, onRetry, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  // The level sets the heading's rank, below the page's own heading.
  const Heading =
    HEADINGS[Math.min(item.kind === "header" ? item.depth : 0, 4)] ?? "h2";

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="grouped-item"
    >
      {item.kind === "header" ? (
        <Heading
          className="flex items-baseline justify-between gap-3 border-b border-(--line) pb-1 text-base"
          data-testid="group-header"
          style={{ paddingLeft: `${String(item.depth * 16)}px` }}
        >
          <span>{item.label}</span>
          <span
            className="text-sm text-(--ink-muted)"
            data-testid="group-count"
          >
            {item.count.toLocaleString("en-US")}
          </span>
        </Heading>
      ) : null}
      {item.kind === "cards" ? (
        <div
          className="grid gap-4"
          data-testid="group-cards-row"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {item.meanders.map((meander) => (
            <MeanderCard
              key={meander.id}
              meander={meander}
              view={view}
            />
          ))}
        </div>
      ) : null}
      {item.kind === "pending" ? (
        <p className="text-sm text-(--ink-muted)">Loading…</p>
      ) : null}
      {item.kind === "error" ? (
        <GalleryError
          error={item.error}
          onRetry={() => {
            onRetry(item.leaf);
          }}
        />
      ) : null}
    </div>
  );
}
