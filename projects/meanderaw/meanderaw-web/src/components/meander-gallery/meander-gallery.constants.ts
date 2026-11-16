// ♟️ Constants

/**
 * The space between cards, in pixels.
 */
export const GAP_PIXELS = 16;

/**
 * The narrowest a grid card gets, in pixels.
 */
export const CARD_MIN_WIDTH_PIXELS = 320;

/**
 * A row's guessed height before it is measured, in pixels.
 */
export const ROW_ESTIMATES = { grid: 480, list: 520 } as const;

/**
 * Rows kept mounted past the visible ones, each side.
 */
export const OVERSCAN_ROWS = 2;

/**
 * How near the end, in rows, the next page is asked for.
 */
export const LOAD_AHEAD_ROWS = 3;
