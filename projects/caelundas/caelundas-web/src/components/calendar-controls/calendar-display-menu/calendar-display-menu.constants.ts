// ♟️ Constants

export const TITLE = "Display";

/** A chip styled like the buttons beside it. */
export const CHIP_CLASS_NAME = "bg-background dark:bg-input/30";

/** The figure choices the sky can draw, each named. */
export const CONSTELLATION_CHOICES = [
  { label: "All", value: "all", words: ["all"] },
  { label: "Zodiac", value: "zodiac", words: ["zodiac"] },
  { label: "None", value: "none", words: [] },
] as const;

/** The choice coloring events by kind, the default. */
export const DEFAULT_COLOR_BY = "default";

/** The sky colors the list offers, each named. */
export const COLOR_SWATCHES = [
  { label: "Midnight", value: "#04060f" },
  { label: "Navy", value: "#0d1533" },
  { label: "Indigo", value: "#1b2a5c" },
  { label: "Plum", value: "#3b1f5e" },
  { label: "Wine", value: "#5c1f2a" },
  { label: "White", value: "#ffffff" },
  { label: "Sky blue", value: "#7dd3fc" },
  { label: "Amber", value: "#fbbf24" },
] as const;

/** How many values a numeric setting offers, least to most. */
export const STEP_COUNT = 5;

/**
 * The choice that leaves events uncolored.
 */
export const NO_COLOR = "none";

/** The branch whose content is the view radio group. */
export const CALENDAR_BRANCH = "branch:calendar";

/** The branch whose content is the timeline scale radio group. */
export const SCALE_BRANCH = "branch:scale";
