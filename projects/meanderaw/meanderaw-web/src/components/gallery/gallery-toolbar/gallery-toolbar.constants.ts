import type { GalleryView } from "../../../hooks/use-gallery-search/use-gallery-search.types";

// ♟️ Constants

/**
 * The name each view goes by on its button.
 */
export const VIEW_LABELS: Readonly<Record<GalleryView, string>> = {
  grid: "Grid",
  list: "List",
};
