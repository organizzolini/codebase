// ♟️ Constants

/**
 * The space between cards, in pixels.
 */
export const GAP_PIXELS = 16;

/**
 * The narrowest a grid card gets before a column gives way, in pixels.
 */
export const CARD_MIN_WIDTH_PIXELS = 256;

/**
 * How tall a row of cards is guessed to be before it is measured, in pixels.
 */
export const ROW_ESTIMATES = { grid: 420, list: 140 } as const;

/**
 * How many rows past the visible ones stay mounted on each side.
 */
export const OVERSCAN_ROWS = 2;

/**
 * How near the end, in rows, the next page is asked for.
 */
export const LOAD_AHEAD_ROWS = 3;
