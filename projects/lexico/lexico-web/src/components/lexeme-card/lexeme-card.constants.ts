// ♟️ Constants

/**
 * The ways a search can match a lexeme through one of its inflected forms, as
 * opposed to its headword, a prefix of it, or a translation: only then is it
 * worth saying which form matched.
 */
export const FORM_MATCHES = new Set(["ENCLITIC", "WORD_EXACT"]);
