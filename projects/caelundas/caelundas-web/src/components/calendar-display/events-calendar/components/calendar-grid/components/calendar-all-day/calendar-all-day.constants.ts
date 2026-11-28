// ♟️ Constants

/**
 * The all-day row's states, least first.
 */
export const ALL_DAY_MODES = ["contracted", "grouped", "expanded"] as const;

/**
 * The state after each, wrapping back to the slim row.
 */
export const NEXT_ALL_DAY_MODE: Readonly<
  Record<(typeof ALL_DAY_MODES)[number], (typeof ALL_DAY_MODES)[number]>
> = {
  contracted: "grouped",
  expanded: "contracted",
  grouped: "expanded",
};

/**
 * What the control's tooltip calls each state.
 */
export const ALL_DAY_LABELS: Readonly<
  Record<(typeof ALL_DAY_MODES)[number], string>
> = {
  contracted: "one row of counts",
  expanded: "every event",
  grouped: "grouped",
};

/**
 * The tallest the row grows before it scrolls.
 */
export const ALL_DAY_MAX_HEIGHT = "max-h-[40vh]";
