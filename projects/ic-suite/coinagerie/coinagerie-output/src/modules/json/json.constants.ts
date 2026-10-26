// ♟️ Constants

/**
 * One JSON string token, quotes included, escapes honored.
 *
 * In a flat object of strings the tokens alternate key and value, which is
 * what lets a duplicated key be found: `JSON.parse` keeps only the last.
 */
export const STRING_TOKEN_PATTERN = /"(?:[^"\\]|\\.)*"/gu;
