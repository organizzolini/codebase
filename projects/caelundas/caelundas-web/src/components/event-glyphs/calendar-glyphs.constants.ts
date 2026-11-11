/**
 * Two-or-more-letter words, skipping one-letter aspect symbols.
 */
export const WORD_START = /(?<=^|\s)\p{L}{2,}/u;

/**
 * The spaces between symbols, which the symbols are drawn without.
 */
export const SPACES = /\s+/gu;
