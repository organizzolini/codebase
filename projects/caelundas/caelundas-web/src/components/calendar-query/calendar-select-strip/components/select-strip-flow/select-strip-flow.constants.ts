// ♟️ Constants

// Items abut on one shared border, pulled back over the toolbar's gap. Only
// the strip's first and last corners are rounded; line-break edges stay
// square. An open menu adds focus-guard spans beside its trigger, so the last
// button is found with :has(~[data-slot]), not :last-child.

/** Flows the strip's items in the toolbar's row, joined across lines. */
export const SELECT_FLOW_CLASS_NAME = [
  "contents",
  "[&_[data-strip-chip]]:-ml-2",
  "[&_[data-strip-chip][data-line-start]]:ml-0",
  "[&_[data-strip-chip]>[data-slot]:first-child]:rounded-l-none!",
  "[&_[data-strip-chip]:not([data-line-start])>[data-slot]:first-child]:border-l-0",
  "[&_[data-strip-item]:not(:last-child)>[data-slot]:not(:has(~[data-slot]))]:rounded-r-none!",
].join(" ");

/** Keeps an item whole: a line breaks between items, never inside one. */
export const ITEM_CLASS_NAME = "shrink-0";
