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
