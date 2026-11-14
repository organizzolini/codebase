import { GALLERY_VIEWS } from "../../hooks/use-gallery-search/use-gallery-search.constants";

import { VIEW_LABELS } from "./gallery-toolbar.constants";

import type { GalleryView } from "../../hooks/use-gallery-search/use-gallery-search.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view showing, and how to pick the other.
 */
export interface GalleryToolbarProperties {
  className?: string;
  onViewChange: (view: GalleryView) => void;
  totalCount: number;
  view: GalleryView;
}

// 🧩 Component

/**
 * Renders the controls above the cards: the grid and list toggle.
 */
export function GalleryToolbar(
  properties: Readonly<GalleryToolbarProperties>,
): ReactNode {
  const { className, onViewChange, totalCount, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-toolbar"
    >
      <p className="text-sm text-(--ink-muted)">
        {totalCount.toLocaleString("en-US")} meanders
      </p>
      <div
        aria-label="View"
        className="flex gap-1"
        role="group"
      >
        {GALLERY_VIEWS.map((option) => (
          <button
            key={option}
            aria-pressed={option === view}
            className="rounded-md border border-(--line) px-3 py-1 text-sm aria-pressed:bg-(--accent) aria-pressed:text-(--accent-ink)"
            onClick={() => {
              onViewChange(option);
            }}
            type="button"
          >
            {VIEW_LABELS[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
