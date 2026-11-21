import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the empty notice accepts.
 */
export interface GalleryEmptyProperties {
  className?: string;
}

// 🧩 Component

/**
 * Renders the notice shown when no meander is stored yet.
 */
export function GalleryEmpty(
  properties: Readonly<GalleryEmptyProperties>,
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
      data-testid="gallery-empty"
      role="status"
    >
      <p className="text-(--ink-muted)">
        No meanders yet. Run the draw command in meanderaw-cli to fill the
        gallery.
      </p>
    </div>
  );
}
