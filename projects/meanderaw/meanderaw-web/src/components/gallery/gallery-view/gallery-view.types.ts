import type {
  GALLERY_VIEWS,
  SORT_DIRECTIONS,
} from "../../../hooks/use-gallery-search/use-gallery-search.constants";
import type { FilterLink } from "../gallery-filters/components/filter-query/filter-query.types";

// 🏷️ Types

/**
 * A named view: a layout, grouping, sort and filter set at once.
 */
export interface ViewPreset {
  description: string;
  id: string;
  name: string;
  /** The characteristic keys it needs, none of which may be missing. */
  requires: readonly string[];
  state: ViewState;
}

/**
 * What a view fixes: layout, filter, grouping and sort.
 */
export interface ViewState {
  direction: (typeof SORT_DIRECTIONS)[number];
  group: readonly string[];
  link: FilterLink;
  sort: string;
  view: (typeof GALLERY_VIEWS)[number];
}
