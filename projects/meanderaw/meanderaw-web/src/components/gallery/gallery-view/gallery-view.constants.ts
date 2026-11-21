import { DEFAULT_FILTER_LINK } from "../gallery-filters/components/filter-query/filter-query.constants";

import type { ViewPreset, ViewState } from "./gallery-view.types";

// ♟️ Constants

/**
 * What each layout is called.
 */
export const LAYOUT_NAMES: Readonly<Record<ViewState["view"], string>> = {
  grid: "Grid",
  list: "List",
};

/**
 * The parts of the state a view may fix.
 */
export const VIEW_STATE_KEYS: readonly (keyof ViewState)[] = [
  "direction",
  "group",
  "link",
  "sort",
  "view",
];

/**
 * The views on offer: the two layouts, then saved arrangements.
 */
export const VIEW_PRESETS: readonly ViewPreset[] = [
  {
    description: "Cards in a grid, several to a row",
    id: "grid",
    kind: "layout",
    name: "Grid",
    state: { view: "grid" },
  },
  {
    description: "Cards in a list, one to a row",
    id: "list",
    kind: "layout",
    name: "List",
    state: { view: "list" },
  },
  {
    description: "The default filter with no grouping: rows = 4, repeats = 12",
    id: "default",
    isDefault: true,
    kind: "saved",
    name: "Rows 4, repeats 12",
    state: { group: [], link: DEFAULT_FILTER_LINK },
  },
  {
    description: "Group the meanders by rows, then by columns",
    id: "by-rows-columns",
    kind: "saved",
    name: "By rows then columns",
    state: { group: ["rows", "columns"] },
  },
];
