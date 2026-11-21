import type { FilterLink } from "../../components/gallery/gallery-filters/components/filter-query/filter-query.types";
import type { ViewState } from "../../components/gallery/gallery-view/gallery-view.types";
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
  handleFilterChange: (link: FilterLink) => void;
  handleGroupChange: (group: string[]) => void;
  handleSizeChange: (size: number) => void;
  handleSortChange: (
    sort: string | undefined,
    direction: SortDirection,
  ) => void;
  handleViewApply: (state: Partial<ViewState>) => void;
  /** How many times each drawing repeats its tile. */
  repeats: number;
  /** How many cards a page of a flat gallery holds. */
  size: number;
  /** The field the cards are sorted by, or none for the API's own order. */
  sort: string | undefined;
  view: GalleryView;
}
