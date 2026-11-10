// ♟️ Constants

/**
 * Combining marks that carry a macron once a string is decomposed to NFD.
 * Matches what `lexico-cli` strips from stored lemmas and words.
 */
export const COMBINING_DIACRITICS_PATTERN = /[̀-ͯ]/gu;
