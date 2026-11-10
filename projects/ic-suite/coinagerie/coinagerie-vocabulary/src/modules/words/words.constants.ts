// ♟️ Constants

/**
 * Anything that is not part of a word: `_`, `-`, `.`, spaces, and other
 * separators.
 */
export const SEPARATOR_PATTERN = /[^\p{L}\p{M}\p{N}]+/u;

/**
 * A word part of a separator-free name: uppercase run (`HTTP`), cased run
 * (`Server`), or digits (`64`). Digits attach to the letters before them.
 */
export const WORD_PART_PATTERN =
  /\p{Lu}+(?![\p{Ll}\p{Lo}\p{Lm}])\p{N}*|\p{Lu}?[\p{Ll}\p{Lo}\p{Lm}\p{M}]+\p{N}*|\p{N}+[\p{Ll}\p{Lo}\p{Lm}\p{M}]*/gu;

/** A word made only of digits, which is a number rather than a term. */
export const NUMBER_PATTERN = /^\p{N}+$/u;

/**
 * A word of at least two characters, counted as code points rather than
 * UTF-16 units; one-letter words are noise.
 */
export const TERM_LENGTH_PATTERN = /^.{2,}$/su;
