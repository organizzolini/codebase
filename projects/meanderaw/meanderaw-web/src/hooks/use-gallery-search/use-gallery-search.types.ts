import type { FilterGroup } from "../../components/gallery-filter-builder/gallery-filter-builder.types";
import type {
  GALLERY_VIEWS,
  SORT_DIRECTIONS,
} from "./use-gallery-search.constants";

// 🏷️ Types

/**
 * How the gallery lays its cards out.
 */
export type GalleryView = (typeof GALLERY_VIEWS)[number];

/**
 * Which way a sort runs.
 */
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

/**
 * The gallery's state read from the link, and how to change it.
 */
export interface UseGallerySearchResult {
  /** Which way the sort runs; ascending when the link names none. */
  direction: SortDirection;
  /** The fields the cards are grouped by, outermost first; none when flat. */
  group: string[];
  handleFilterChange: (filter: FilterGroup | undefined) => void;
  handleGroupChange: (group: string[]) => void;
  handleSortChange: (
    sort: string | undefined,
    direction: SortDirection,
  ) => void;
  handleViewChange: (view: GalleryView) => void;
  /** The field the cards are sorted by, or none for the API's own order. */
  sort: string | undefined;
  view: GalleryView;
}
