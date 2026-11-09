// ♟️ Constants

/**
 * Joins an instance's directory, name, and scope kind into a map key. NUL cannot
 * occur in the three, so it never collides.
 */
export const INSTANCE_KEY_SEPARATOR = "\u0000";

/**
 * Coverage at which an instance has every file a template declares. Templates
 * reaching it together are all applied, not reported as ambiguous.
 */
export const COMPLETE_MATCH_RATIO = 1;

/** Matches a filename's final extension, used to name an unsuffixed file. */
export const FILE_EXTENSION_PATTERN = /\.[^.]+$/u;

/** Characters that make a glob segment a pattern rather than a literal name. */
export const GLOB_WILDCARD_CHARACTERS = ["*", "?", "]"];

/**
 * Minimum share of a template's files an instance must have to match. Zero, so
 * ranking decides; a higher floor would hide drifted instances.
 */
export const MINIMUM_MATCH_RATIO = 0;
