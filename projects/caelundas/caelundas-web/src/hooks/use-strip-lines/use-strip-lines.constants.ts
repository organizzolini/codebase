// ♟️ Constants

/** Matches the strip's items, in document order. */
export const STRIP_ITEM_SELECTOR =
  "[data-strip-item], [data-slot=filter-chip], [data-strip-buttons] > [data-slot]";

// Buttons stay whole and wrap between rows. The group already squares every
// inner corner, so a joint at a line break is square; a button opening a line
// only needs its left border back.

/** Wraps a button group's buttons, square at every line break. */
export const BUTTON_STRIP_CLASS_NAME =
  "flex-wrap gap-y-2 *:shrink-0 [&>[data-line-start]]:border-l!";

/** Set on an item that opens a line of the strip. */
export const LINE_START_ATTRIBUTE = "data-line-start";

/** Set on an item that closes a line of the strip. */
export const LINE_END_ATTRIBUTE = "data-line-end";
