import type { GALLERY_VIEWS } from "./use-gallery-search.constants";

// 🏷️ Types

/**
 * How the gallery lays its cards out.
 */
export type GalleryView = (typeof GALLERY_VIEWS)[number];

/**
 * The gallery's state read from the link, and how to change it.
 */
export interface UseGallerySearchResult {
  handleViewChange: (view: GalleryView) => void;
  view: GalleryView;
}
