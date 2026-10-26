// ♟️ Constants

/**
 * One JSON token: a string with its quotes and escapes, a bracket, comma, or
 * colon, or any other run of literal characters. Whitespace is skipped.
 *
 * Enough to walk an object's top level and tell its keys from its values,
 * which is what lets a duplicated key be found: `JSON.parse` keeps only the
 * last, whatever type the first one had.
 */
export const TOKEN_PATTERN = /"(?:[^"\\]|\\.)*"|[[\]{},:]|[^\s[\]{},:"]+/gu;
