import {
  DEFAULT_GALLERY_VIEW,
  DEFAULT_SORT_DIRECTION,
  DEFAULT_SORT_FIELD,
} from "../../../hooks/use-gallery-search/use-gallery-search.constants";
import { DEFAULT_FILTER_LINK } from "../gallery-filters/components/filter-query/filter-query.constants";

import type { ViewPreset, ViewState } from "./gallery-view.types";

// ♟️ Constants

/**
 * What the page opens on.
 */
export const DEFAULT_VIEW_STATE: ViewState = {
  direction: DEFAULT_SORT_DIRECTION,
  group: [],
  link: DEFAULT_FILTER_LINK,
  sort: DEFAULT_SORT_FIELD,
  view: DEFAULT_GALLERY_VIEW,
};

/**
 * What the View button says when no preset matches.
 */
export const CUSTOM_NAME = "Custom";

/**
 * The parts of the state a view fixes.
 */
export const VIEW_STATE_KEYS: readonly (keyof ViewState)[] = [
  "direction",
  "group",
  "link",
  "sort",
  "view",
];

/**
 * The presets, before the catalog is asked.
 */
export const VIEW_PRESETS: readonly ViewPreset[] = [
  {
    description: "A grid, ungrouped, rows ascending, rows = 4, repeats = 12",
    id: "default",
    name: "Default",
    requires: [],
    state: DEFAULT_VIEW_STATE,
  },
  {
    description: "Group the meanders by rows, then by columns",
    id: "by-rows-columns",
    name: "By rows then columns",
    requires: [],
    state: { ...DEFAULT_VIEW_STATE, group: ["rows", "columns"] },
  },
  {
    description: "Sort by corner count, the most first",
    id: "most-corners",
    name: "Most corners first",
    requires: ["cornerCount"],
    state: { ...DEFAULT_VIEW_STATE, direction: "desc", sort: "cornerCount" },
  },
  {
    description: "Group the meanders by Betti number 0 count",
    id: "by-betti",
    name: "By Betti number 0 count",
    requires: ["bettiNumber0Count"],
    state: { ...DEFAULT_VIEW_STATE, group: ["bettiNumber0Count"] },
  },
];
