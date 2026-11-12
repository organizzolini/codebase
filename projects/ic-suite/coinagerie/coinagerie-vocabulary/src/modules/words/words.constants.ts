// ♟️ Constants

/** Non-word characters: `_`, `-`, `.`, spaces, and other separators. */
export const SEPARATOR_PATTERN = /[^\p{L}\p{M}\p{N}]+/u;

/** A word part: uppercase (`HTTP`), cased (`Server`), or digits (`64`). */
export const WORD_PART_PATTERN =
  /\p{Lu}+(?![\p{Ll}\p{Lo}\p{Lm}])\p{N}*|\p{Lu}?[\p{Ll}\p{Lo}\p{Lm}\p{M}]+\p{N}*|\p{N}+[\p{Ll}\p{Lo}\p{Lm}\p{M}]*/gu;

/** A word of only digits: a number, not a term. */
export const NUMBER_PATTERN = /^\p{N}+$/u;

/** Counted in code points, not UTF-16 units; one-letter words are noise. */
export const TERM_LENGTH_PATTERN = /^.{2,}$/su;
