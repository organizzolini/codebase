// ♟️ Constants

/**
 * Runs a forms Frame edge to edge across the card's padding, square so it
 * meets the card's other sections without corners.
 */
export const FORMS_FRAME = "-mx-3 [--frame-radius:0px]";

/** Drops a panel's padding, so tabs and tables sit flush with its dividers. */
export const FLUSH_PANEL = "p-0";

/** A short row of tabs spanning its panel with no pill behind the list. */
export const FORMS_TAB_LIST =
  "w-full gap-0 rounded-none p-0 group-data-[orientation=horizontal]/tabs:h-6";

/**
 * A borderless tab that never fills its background, hovered or selected, and
 * shows no underline; its pill carries the selected state.
 */
export const FORMS_TAB =
  "min-w-0 rounded-none border-0 px-0 py-0 text-muted-foreground hover:bg-transparent group-data-[variant=line]/tabs-list:data-active:after:opacity-0";

/** A table row without the stock hover fill. */
export const FORMS_ROW = "hover:bg-transparent";
