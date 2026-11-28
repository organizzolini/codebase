// ♟️ Constants

/**
 * The id prefix of a long event's start or end block.
 */
export const EDGE_ID_PREFIX = "edge:";

/**
 * Second-of-day formatters, one per zone.
 */
export const SECOND_FORMATS = new Map<string, Intl.DateTimeFormat>();

/**
 * Seconds each time part is worth; other parts are worth none.
 */
export const SECONDS_PER_PART: ReadonlyMap<string, number> = new Map([
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
]);

export const DAY_MILLISECONDS = 86_400_000;

export const SECOND_MILLISECONDS = 1000;

export const MINUTE_MILLISECONDS = 60_000;
