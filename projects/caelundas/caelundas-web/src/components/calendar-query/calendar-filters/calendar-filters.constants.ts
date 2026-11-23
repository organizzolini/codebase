import { FilterDateRangeEditor } from "../filter-date-range-editor/filter-date-range-editor";
import { FilterTagEditor } from "../filter-tag-editor/filter-tag-editor";

import {
  DATE_RANGE_EDITOR,
  TAG_OPTIONS_EDITOR,
} from "./components/event-filter-model/event-filters.constants";

import type { FilterEditorRegistry } from "@codebase/presentation";

// ♟️ Constants

export const TITLE = "Filter";

export const EDITORS: FilterEditorRegistry = {
  [DATE_RANGE_EDITOR]: FilterDateRangeEditor,
  [TAG_OPTIONS_EDITOR]: FilterTagEditor,
};

export const TABLET_QUERY = "(min-width: 768px)";

/**
 * Joins Filter to its chips: square right, raised on focus.
 */
export const FILTERS_BUTTON_CLASS_NAME =
  "focus-visible:relative focus-visible:z-10";

/**
 * Square right edge for the Filter button when chips follow it.
 */
export const JOINED_BUTTON_CLASS_NAME =
  "in-data-[slot=button-group]:rounded-r-none";

/** Filter and its chips as one strip: flat ends, one border. */
export const STRIP_CLASS_NAME =
  "flex min-w-0 flex-wrap items-start [&_[data-slot=filter-chip]>*]:rounded-none! [&_[data-slot=filter-chip]:not(:last-child)>[data-slot]:last-child]:rounded-r-none! [&_[data-slot=filter-chip]>*]:border-l-0 [&_[data-slot=filter-chip]:last-child>[data-slot]:last-child]:rounded-r-lg! [&_[aria-label=Navigate]>:first-child]:rounded-l-none! [&_[aria-label=Navigate]>:first-child]:border-l-0 [&_[aria-label=Navigate]>:last-child]:rounded-r-lg! data-joined:[&_[aria-label=Navigate]>:last-child]:rounded-r-none! [&_[aria-label=Filter]>[data-slot=popover-trigger][data-slot=popover-trigger]]:rounded-l-lg! [&_[aria-label=Filter]>[data-slot=popover-trigger][data-slot=popover-trigger]]:border-l! data-attached:[&_[aria-label=Filter]>[data-slot=popover-trigger][data-slot=popover-trigger]]:rounded-r-none!";
