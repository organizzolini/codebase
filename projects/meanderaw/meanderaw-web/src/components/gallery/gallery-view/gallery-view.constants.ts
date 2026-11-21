import {
  DEFAULT_GALLERY_VIEW,
  DEFAULT_GROUP_FIELD,
  DEFAULT_SORTS,
} from "../../../hooks/use-gallery-search/use-gallery-search.constants";
import { DEFAULT_FILTER_LINK } from "../gallery-filters/components/filter-query/filter-query.constants";

import type { ViewState } from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type { ViewPreset } from "./gallery-view.types";

// ♟️ Constants

/**
 * What the page opens on: grouped by rows, a grid, rows ascending.
 */
export const DEFAULT_VIEW_STATE: ViewState = {
  group: [DEFAULT_GROUP_FIELD],
  link: DEFAULT_FILTER_LINK,
  sorts: DEFAULT_SORTS,
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
  "group",
  "link",
  "sorts",
  "view",
];

/**
 * The presets, before the catalog is asked.
 */
export const VIEW_PRESETS: readonly ViewPreset[] = [
  {
    description: "Grouped by rows, rows ascending, rows = 4, repeats = 12",
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
    state: {
      ...DEFAULT_VIEW_STATE,
      sorts: [{ direction: "desc", field: "cornerCount" }],
    },
  },
  {
    description: "Group the meanders by Betti number 0 count",
    id: "by-betti",
    name: "By Betti number 0 count",
    requires: ["bettiNumber0Count"],
    state: { ...DEFAULT_VIEW_STATE, group: ["bettiNumber0Count"] },
  },
];
