// ♟️ Constants

/**
 * Compares text the way a person counts: digits as numbers, so "Harmonic 2" comes before "Harmonic 10".
 */
export const NATURAL_COLLATOR = new Intl.Collator("en-US", { numeric: true });

/**
 * What separates the names in a tag's path.
 */
export const PATH_SEPARATOR = " / ";
