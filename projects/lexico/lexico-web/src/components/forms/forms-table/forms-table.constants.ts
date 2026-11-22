// ♟️ Constants

/**
 * Runs a forms Frame edge to edge across the card's padding, square so it
 * meets the card's other sections without corners.
 */
export const FORMS_FRAME = "-mx-3 [--frame-radius:0px]";

/** Drops a panel's padding, so tabs and tables sit flush with its dividers. */
export const FLUSH_PANEL = "p-0";

/** A row of tabs spanning its panel with no pill behind the list. */
export const FORMS_TAB_LIST = "w-full gap-0 rounded-none p-0";

/**
 * A tab that is transparent with muted text, except the selected one, which
 * alone takes a filled background and no underline.
 */
export const FORMS_TAB =
  "min-w-0 rounded-none px-0 text-muted-foreground group-data-[variant=line]/tabs-list:data-active:bg-muted group-data-[variant=line]/tabs-list:data-active:text-foreground group-data-[variant=line]/tabs-list:data-active:after:opacity-0 dark:group-data-[variant=line]/tabs-list:data-active:bg-muted";
