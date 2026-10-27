import {
  DATE_RANGE_EDITOR,
  TAG_OPTIONS_EDITOR,
} from "../constants/event-filters.constants";

import { FilterDateRangeEditor } from "./filter-date-range-editor";
import { FilterTagEditor } from "./filter-tag-editor";

import type { FilterEditorRegistry } from "@codebase/presentation";

export const TITLE = "Filter";

export const EDITORS: FilterEditorRegistry = {
  [DATE_RANGE_EDITOR]: FilterDateRangeEditor,
  [TAG_OPTIONS_EDITOR]: FilterTagEditor,
};

export const TABLET_QUERY = "(min-width: 768px)";
