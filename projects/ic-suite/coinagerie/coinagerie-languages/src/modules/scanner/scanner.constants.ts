// ♟️ Constants

import type { LexicalRule } from "./scanner.types";

/**
 * A number and its suffix, such as `10px`. Skipped so `0x1F` letters are not
 * names; listed last, so digit-led rules still win.
 */
export const NUMBER_RULE: LexicalRule = {
  kind: "comment",
  pattern: /[0-9][\p{L}\p{N}_]*/uy,
};

/** What a plain identifier looks like in a language with no special marks. */
export const PLAIN_IDENTIFIER = /[\p{L}_][\p{L}\p{N}_]*/uy;
