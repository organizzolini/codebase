// ♟️ Constants

/**
 * One word's bullet: `- **word**:` and, after one space, the first line of its
 * definition. Nothing but the definition may follow the colon.
 */
export const BULLET_PATTERN = /^- \*\*(?<word>[^*]+)\*\*:(?<rest>.*)$/u;

/** Any markdown list item, which ends the free-text preamble of a block. */
export const LIST_ITEM_PATTERN = /^[-*+]\s/u;

/** A line continuing the definition above it: indented, and not blank. */
export const CONTINUATION_PATTERN = /^[ \t]+\S/u;
