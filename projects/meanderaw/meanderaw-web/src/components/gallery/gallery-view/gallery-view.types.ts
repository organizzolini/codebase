import type {
  GALLERY_VIEWS,
  SORT_DIRECTIONS,
} from "../../../hooks/use-gallery-search/use-gallery-search.constants";
import type { FilterLink } from "../gallery-filters/components/filter-query/filter-query.types";

// 🏷️ Types

/**
 * A named view: a layout or a saved arrangement.
 */
export interface ViewPreset {
  description: string;
  id: string;
  /** Whether it is how the page opens, so it never names the view. */
  isDefault?: true;
  /** Whether it names a layout alone or a saved arrangement. */
  kind: "layout" | "saved";
  name: string;
  /** The parts of the state it fixes; the rest stay as they are. */
  state: Partial<ViewState>;
}

/**
 * What a view fixes: layout, filter, grouping and sort.
 */
export interface ViewState {
  direction: (typeof SORT_DIRECTIONS)[number];
  group: readonly string[];
  link: FilterLink;
  sort: string | undefined;
  view: (typeof GALLERY_VIEWS)[number];
}
