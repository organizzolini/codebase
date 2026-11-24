// ♟️ Constants

export const TITLE = "View";

export const ALL_EVENTS_ID = "all-events";

export const CUSTOM_ID = "custom";

/** A chip styled like the buttons beside it. */
export const CHIP_CLASS_NAME = "bg-background dark:bg-input/30";

/** The icon of a view with none of its own. */
export const DEFAULT_VIEW_ICON = "eye";

/** The lucide icon of each view, by id. */
export const VIEW_ICONS: Readonly<Record<string, string>> = {
  "all-events": "layers",
  "aspect-patterns": "shapes",
  "aspects-without-the-moon": "orbit",
  custom: "pencil-ruler",
  "daily-cycles": "sunrise",
  highlights: "sparkles",
  "major-aspects": "triangle",
  "planet-sign-events": "arrow-right-left",
  "planetary-cycles": "refresh-cw",
};
