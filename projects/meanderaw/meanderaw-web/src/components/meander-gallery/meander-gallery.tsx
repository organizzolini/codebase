import { GalleryEmpty } from "../gallery-empty/gallery-empty";
import { MeanderCard } from "../meander-card/meander-card";

import { LAYOUT_CLASSES } from "./meander-gallery.constants";

import type { GalleryView } from "../../hooks/use-gallery-search/use-gallery-search.types";
import type { GalleryMeander } from "./meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The meanders to show, and the view that lays them out.
 */
export interface MeanderGalleryProperties {
  className?: string;
  meanders: readonly GalleryMeander[];
  view: GalleryView;
}

// 🧩 Component

/**
 * Renders the meanders as cards in a grid or a list, or says there are none.
 */
export function MeanderGallery(
  properties: Readonly<MeanderGalleryProperties>,
): ReactNode {
  const { className, meanders, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (meanders.length === 0) {
    return <GalleryEmpty />;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="meander-gallery"
    >
      <ul className={LAYOUT_CLASSES[view]}>
        {meanders.map((meander) => (
          <li key={meander.id}>
            <MeanderCard
              meander={meander}
              view={view}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
