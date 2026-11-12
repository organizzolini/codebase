// ♟️ Constants

/** Identifying prose for a block, short enough to fit one line. */
export const COMMENT_EXCERPT_LENGTH = 48;

/** What a measured comment block is called in a report. */
export const COMMENT_KIND = "comment";

/** Matches an HCL `#` comment through to the end of its line. */
export const HCL_HASH_LINE_COMMENT_PATTERN = /#[^\n]*/g;

/** Matches an HCL `//` comment through to the end of its line. */
export const HCL_SLASH_LINE_COMMENT_PATTERN = /\/\/[^\n]*/g;

/** The `#` comment marker and its space, shared by four languages. */
export const HASH_COMMENT_MARKER_PATTERN = /^\s*#+\s?/u;
