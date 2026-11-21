// ♟️ Constants

export const TITLE = "Group";

/**
 * Joins the trigger to its chips: flat inner edges, one border between.
 */
export const STRIP_CLASS_NAME =
  "[&>[data-slot=button]:not(:first-child)]:rounded-l-none [&>[data-slot=button]:not(:first-child)]:border-l-0 [&>[data-slot=button]:not(:last-child)]:rounded-r-none";

/**
 * Only the active item is shaded; cmdk writes `data-selected="false"` on the rest.
 */
export const ITEM_CLASS_NAME = "data-[selected=false]:bg-transparent";
