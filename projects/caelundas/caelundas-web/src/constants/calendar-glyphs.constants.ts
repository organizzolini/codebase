/**
 * The start of a word of English, after the start of the summary or a space:
 * two letters or more, so that the one-letter symbols of some aspects, such as
 * the N of a novile, are not read as words.
 */
export const WORD_START = /(?<=^|\s)\p{L}{2,}/u;

/**
 * The spaces between symbols, which the symbols are drawn without.
 */
export const SPACES = /\s+/gu;
