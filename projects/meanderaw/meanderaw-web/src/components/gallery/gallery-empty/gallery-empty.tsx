import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the empty notice accepts.
 */
export interface GalleryEmptyProperties {
  className?: string;
  /** Whether a filter is narrowing the meanders, rather than none being stored. */
  isFiltered?: boolean;
}

// 🧩 Component

/**
 * Renders the notice shown when there are no meanders to show.
 */
export function GalleryEmpty(
  properties: Readonly<GalleryEmptyProperties>,
): ReactNode {
  const { className, isFiltered = false } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-empty"
      role="status"
    >
      <p className="text-(--ink-muted)">
        {isFiltered
          ? "No meanders match these filters. Change or remove a filter to see more."
          : "No meanders yet. Run the draw command in meanderaw-cli to fill the gallery."}
      </p>
    </div>
  );
}
