import { FilterDateRangeEditor } from "../filter-date-range-editor/filter-date-range-editor";
import { FilterTagEditor } from "../filter-tag-editor/filter-tag-editor";

import {
  DATE_RANGE_EDITOR,
  TAG_OPTIONS_EDITOR,
} from "./event-filters.constants";

import type { FilterEditorRegistry } from "@codebase/presentation";

// ♟️ Constants

export const TITLE = "Filter";

export const EDITORS: FilterEditorRegistry = {
  [DATE_RANGE_EDITOR]: FilterDateRangeEditor,
  [TAG_OPTIONS_EDITOR]: FilterTagEditor,
};

export const TABLET_QUERY = "(min-width: 768px)";

/**
 * The Filters button's join to Clear in their button group: square on the
 * right, raised above Clear while focused so its ring shows whole.
 */
export const FILTERS_BUTTON_CLASS_NAME =
  "in-data-[slot=button-group]:rounded-r-none focus-visible:relative focus-visible:z-10";
