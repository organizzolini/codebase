import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo } from "react";

import { useElementBox } from "../../../hooks/use-element-box/use-element-box";
import { MeanderCard } from "../../meander/meander-card/meander-card";
import { GalleryEmpty } from "../gallery-empty/gallery-empty";
import { GalleryError } from "../gallery-error/gallery-error";

import {
  LOAD_AHEAD_ROWS,
  OVERSCAN_ROWS,
  ROW_ESTIMATES,
} from "./meander-gallery.constants";
import { getColumnCount, toRows } from "./meander-gallery.utilities";

import type { GalleryView } from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type {
  GalleryCharacteristic,
  GalleryMeander,
} from "./meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Meanders so far, the catalog, how to read more, the view.
 */
export interface MeanderGalleryProperties {
  catalog: readonly GalleryCharacteristic[];
  className?: string;
  hasMore: boolean;
  loadError: unknown;
  meanders: readonly GalleryMeander[];
  onLoadMore: () => void;
  repeats: number;
  view: GalleryView;
}

// 🧩 Component

/**
 * Renders the meanders as virtualized rows of cards, asking for the next page
 * as the last rows come near.
 */
export function MeanderGallery(
  properties: Readonly<MeanderGalleryProperties>,
): ReactNode {
  const {
    catalog,
    className,
    hasMore,
    loadError,
    meanders,
    onLoadMore,
    repeats,
    view,
  } = properties;

  // 🪝 Hooks
  const { setElement, top, width } = useElementBox();
  const columns = getColumnCount(width, view);
  const rows = useMemo(() => toRows(meanders, columns), [meanders, columns]);
  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_ESTIMATES[view],
    overscan: OVERSCAN_ROWS,
    scrollMargin: top,
  });

  // 🏗 Setup
  const items = virtualizer.getVirtualItems();
  const lastIndex = items.at(-1)?.index ?? -1;
  const isNearEnd = lastIndex >= rows.length - LOAD_AHEAD_ROWS;

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    if (hasMore && isNearEnd && loadError === undefined) {
      onLoadMore();
    }
  }, [hasMore, isNearEnd, loadError, onLoadMore, rows.length]);

  // 🏁 Early Returns
  if (meanders.length === 0) {
    return <GalleryEmpty />;
  }

  // 🎨 Markup
  return (
    <div
      ref={setElement}
      className={className}
      data-testid="meander-gallery"
    >
      <ul
        className="relative"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {items.map((item) => (
          <li
            key={item.key}
            ref={virtualizer.measureElement}
            className="absolute left-0 grid w-full gap-4 pb-4"
            data-index={item.index}
            data-testid="meander-gallery-row"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              top: item.start - top,
            }}
          >
            {rows[item.index]?.map((meander) => (
              <MeanderCard
                key={meander.id}
                catalog={catalog}
                meander={meander}
                repeats={repeats}
              />
            ))}
          </li>
        ))}
      </ul>
      {loadError === undefined ? null : (
        <GalleryError
          className="pt-2"
          error={loadError}
          onRetry={onLoadMore}
        />
      )}
    </div>
  );
}
