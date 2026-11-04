// ♟️ Constants

/**
 * Anything that is not part of a word: `_`, `-`, `.`, `#`, `$`, spaces, and
 * every other separator a name or a path can carry.
 */
export const SEPARATOR_PATTERN = /[^\p{L}\p{M}\p{N}]+/u;

/**
 * One word part of a separator-free name, in order of preference:
 *
 * 1. an uppercase run not followed by a lowercase letter, with any trailing
 *    digits — `HTTP` in `HTTPServer`, `UTF8` in `getUTF8String`;
 * 2. an optional capital, a lowercase run, and any trailing digits — `Server`,
 *    `utf8`, `base64`;
 * 3. a digit run with any lowercase letters after it — `64`, `3d`.
 *
 * Digits stay attached to the letters before them, so a term like `utf8`
 * remains one word.
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
