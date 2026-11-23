import type { GalleryFilterQuery } from "../../components/gallery/gallery-filters/components/filter-query/filter-query.types";

// 🏷️ Types

/**
 * The Filters tree, and how to edit it.
 */
export interface UseFilterQueryResult {
  /** Takes an edit of the tree, and writes the link once it changes it. */
  handleQueryChange: (next: GalleryFilterQuery) => void;
  /** The tree the Filters component shows, rows and repeats first. */
  query: GalleryFilterQuery;
}
