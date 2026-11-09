// ♟️ Constants

/**
 * Score an instance must reach when no threshold is configured. A perfect match,
 * as always demanded, so scoring cannot relax existing runs.
 */
export const DEFAULT_THRESHOLD = 1;

/**
 * Joins an instance path and template name into a score key. NUL cannot occur
 * in either, so it never collides.
 */
export const SCORE_KEY_SEPARATOR = "\u0000";

/**
 * Joins an instance path and a template path into a deduplication key. NUL
 * cannot occur in either, so it never collides.
 */
export const FINDING_KEY_SEPARATOR = "\u0000";
