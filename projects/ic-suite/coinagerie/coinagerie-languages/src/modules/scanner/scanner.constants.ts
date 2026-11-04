// ♟️ Constants

import type { LexicalRule } from "./scanner.types";

/**
 * A number, with its suffix or radix: `42`, `0x1F`, `10px`, `1e9`.
 *
 * Skipped by every programming grammar so the letters inside a literal are
 * not read as a name, and listed after a grammar's own rules, so a rule that
 * starts with a digit still wins.
 */
export const NUMBER_RULE: LexicalRule = {
  kind: "comment",
  pattern: /[0-9][\p{L}\p{N}_]*/uy,
};

/** What a plain identifier looks like in a language with no special marks. */
export const PLAIN_IDENTIFIER = /[\p{L}_][\p{L}\p{N}_]*/uy;
