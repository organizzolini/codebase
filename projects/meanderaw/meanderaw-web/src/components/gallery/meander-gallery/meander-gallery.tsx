import { useElementBox } from "../../../hooks/use-element-box/use-element-box";
import { Masonry } from "../../layout/masonry/masonry";
import { MeanderCard } from "../../meander/meander-card/meander-card";
import { GalleryEmpty } from "../gallery-empty/gallery-empty";
import { GalleryError } from "../gallery-error/gallery-error";

import { getColumnCount } from "./meander-gallery.utilities";

import type { GalleryView } from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type {
  GalleryCharacteristic,
  GalleryMeander,
} from "./meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The page's meanders, the catalog, active keys, and the view.
 */
export interface MeanderGalleryProperties {
  /** Characteristics the page is grouped, sorted or filtered by. */
  activeKeys: readonly string[];
  catalog: readonly GalleryCharacteristic[];
  className?: string;
  /** Whether a filter narrows the meanders, for the empty notice. */
  isFiltered: boolean;
  loadError: unknown;
  meanders: readonly GalleryMeander[];
  onRetry: () => void;
  repeats: number;
  view: GalleryView;
}

// 🧩 Component

/**
 * Renders the meanders of the pages showing as a masonry of cards.
 */
export function MeanderGallery(
  properties: Readonly<MeanderGalleryProperties>,
): ReactNode {
  const {
    activeKeys,
    catalog,
    className,
    isFiltered,
    loadError,
    meanders,
    onRetry,
    repeats,
    view,
  } = properties;

  // 🪝 Hooks
  const { setElement, width } = useElementBox();
  const columns = getColumnCount(width, view);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (meanders.length === 0) {
    return <GalleryEmpty isFiltered={isFiltered} />;
  }

  // 🎨 Markup
  return (
    <div
      ref={setElement}
      className={className}
      data-testid="meander-gallery"
    >
      <Masonry columns={columns}>
        {meanders.map((meander) => (
          <MeanderCard
            key={meander.id}
            activeKeys={activeKeys}
            catalog={catalog}
            meander={meander}
            repeats={repeats}
          />
        ))}
      </Masonry>
      {loadError === undefined ? null : (
        <GalleryError
          className="pt-2"
          error={loadError}
          onRetry={onRetry}
        />
      )}
    </div>
  );
}
