import type { ViewState } from "../../../hooks/use-gallery-search/use-gallery-search.types";

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
