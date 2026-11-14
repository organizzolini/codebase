import type { GalleryView } from "../../hooks/use-gallery-search/use-gallery-search.types";

// ♟️ Constants

/**
 * The classes that lay the cards out in each view: columns that fill the
 * width in the grid, one row each in the list.
 */
export const LAYOUT_CLASSES: Readonly<Record<GalleryView, string>> = {
  grid: "grid grid-cols-[repeat(auto-fill,minmax(var(--card-min-width),1fr))] gap-4",
  list: "flex flex-col gap-2",
};
