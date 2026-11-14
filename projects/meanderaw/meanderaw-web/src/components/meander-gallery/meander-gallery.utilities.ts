import { CARD_MIN_WIDTH_PIXELS, GAP_PIXELS } from "./meander-gallery.constants";

import type { GalleryView } from "../../hooks/use-gallery-search/use-gallery-search.types";
import type { GalleryMeander } from "./meanders-api.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * How many cards fit a row: as many as the width holds at the narrowest a
 * card gets, and one in the list.
 */
export function getColumnCount(width: number, view: GalleryView): number {
  return view === "list"
    ? 1
    : Math.max(
        1,
        Math.floor((width + GAP_PIXELS) / (CARD_MIN_WIDTH_PIXELS + GAP_PIXELS)),
      );
}

/**
 * Splits the meanders into rows of `size`, the last holding what is left.
 */
export function toRows(
  meanders: readonly GalleryMeander[],
  size: number,
): GalleryMeander[][] {
  const rows: GalleryMeander[][] = [];

  for (let start = 0; start < meanders.length; start += size) {
    rows.push(meanders.slice(start, start + size));
  }

  return rows;
}
