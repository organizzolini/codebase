// ♟️ Constants

export const TITLE = "Group";

/** Joins a shared tag's id to a row's path. */
export const SHARED_SEPARATOR = "@@";

/** The Group menu lists groupable tags, leaves too. */
export const GROUP_MENU = { flag: "isGroupable", leaves: true } as const;

/** What the strip says where it only colors. */
export const COLOR_HINT = "Colors events by the first group";

/** A chip styled like the buttons beside it. */
export const CHIP_CLASS_NAME = "bg-background dark:bg-input/30";
