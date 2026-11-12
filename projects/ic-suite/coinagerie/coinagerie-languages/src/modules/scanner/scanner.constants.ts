// ♟️ Constants

import type { LexicalRule } from "./scanner.types";

/** Numbers like `10px`, skipped so their letters are not names. */
export const NUMBER_RULE: LexicalRule = {
  kind: "comment",
  pattern: /[0-9][\p{L}\p{N}_]*/uy,
};

/** A plain identifier, in languages without special marks. */
export const PLAIN_IDENTIFIER = /[\p{L}_][\p{L}\p{N}_]*/uy;
