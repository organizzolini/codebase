/**
 * Starts a word of two letters or more, so one-letter aspect symbols such as N are not words.
 */
export const WORD_START = /(?<=^|\s)\p{L}{2,}/u;

/**
 * The spaces between symbols, which the symbols are drawn without.
 */
export const SPACES = /\s+/gu;
