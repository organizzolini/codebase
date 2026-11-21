import type { FilterLink } from "../../components/gallery/gallery-filters/components/filter-query/filter-query.types";
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
 * One field the cards are sorted by, and which way.
 */
export interface SortEntry {
  direction: SortDirection;
  field: string;
}

/**
 * The gallery's state read from the link, and how to change it.
 */
export interface UseGallerySearchResult {
  /** The fields the cards are grouped by, outermost first; none for the default. */
  group: string[] | undefined;
  handleFilterChange: (link: FilterLink) => void;
  handleGroupChange: (group: string[]) => void;
  handleSizeChange: (size: number) => void;
  handleSortChange: (sorts: SortEntry[]) => void;
  handleViewApply: (state: Partial<ViewState>) => void;
  /** How many times each drawing repeats its tile. */
  repeats: number;
  /** How many cards a page of a flat gallery holds. */
  size: number;
  /** The fields the cards are sorted by, in order; none for the default. */
  sorts: SortEntry[];
  view: GalleryView;
}

/**
 * What a view fixes: layout, filter, grouping and sorts.
 */
export interface ViewState {
  group: readonly string[];
  link: FilterLink;
  sorts: readonly SortEntry[];
  view: GalleryView;
}
