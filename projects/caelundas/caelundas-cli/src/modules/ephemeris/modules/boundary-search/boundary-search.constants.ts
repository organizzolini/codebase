// ♟️ Constants

/** Milliseconds in one minute. */
export const MILLISECONDS_PER_MINUTE = 60_000;

/** Minutes around a bracket the detector is tried at, nearest first. */
export const BOUNDARY_PROBE_OFFSETS_MINUTES = [0, 1, -1, 2, -2] as const;

/**
 * Days a search may walk past a range limit to name a boundary the limit
 * cuts off: longer than Mars's synodic period of 780 days.
 */
export const LIMIT_EXTENSION_DAYS = 800;
