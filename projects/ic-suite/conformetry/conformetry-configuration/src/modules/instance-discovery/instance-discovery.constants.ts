// ♟️ Constants

/** Map key joining an instance's directory, name, and scope kind. */
export const INSTANCE_KEY_SEPARATOR = "\u0000";

/** Coverage at which an instance holds every declared file. */
export const COMPLETE_MATCH_RATIO = 1;

/** Matches a filename's final extension, used to name an unsuffixed file. */
export const FILE_EXTENSION_PATTERN = /\.[^.]+$/u;

/** Characters that make a glob segment a pattern. */
export const GLOB_WILDCARD_CHARACTERS = ["*", "?", "]"];

/** Minimum file share to match; zero lets ranking decide. */
export const MINIMUM_MATCH_RATIO = 0;
