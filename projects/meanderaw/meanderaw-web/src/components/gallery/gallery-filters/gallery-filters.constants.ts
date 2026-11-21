// ♟️ Constants

/**
 * The title of the filter surface and the Filter button.
 */
export const FILTERS_TITLE = "Filter";

/**
 * Joins Filter to Clear: square right, raised on focus.
 */
export const FILTERS_BUTTON_CLASS_NAME =
  "in-data-[slot=button-group]:rounded-r-none focus-visible:relative focus-visible:z-10";

/**
 * Squares every join between the Filter button and the chips.
 */
export const STRIP_CLASS_NAME =
  "[&>[data-slot=filter-chip]>:first-child]:rounded-l-none [&>[data-slot=filter-chip]>:first-child]:border-l-0 [&>[data-slot=filter-chip]:has(+[data-slot=filter-chip])>[data-slot=dropdown-menu-trigger]]:rounded-r-none!";
