// ♟️ Constants

/** Word bullet: `- **word**:`, then one space and its definition. */
export const BULLET_PATTERN = /^- \*\*(?<word>[^*]+)\*\*:(?<rest>.*)$/u;

/** Any markdown list item, which ends the free-text preamble of a block. */
export const LIST_ITEM_PATTERN = /^[-*+]\s/u;

/** LF or CRLF line endings, so Windows checkouts parse alike. */
export const LINE_BREAK_PATTERN = /\r?\n/u;

/** A line continuing the definition above it: indented, and not blank. */
export const CONTINUATION_PATTERN = /^[ \t]+\S/u;
