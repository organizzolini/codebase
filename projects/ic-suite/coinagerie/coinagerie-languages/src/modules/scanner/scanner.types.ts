// 🏷️ Types

/** Key test: `after` checks the string's end, `before` what precedes. */
export interface KeyPattern {
  after: RegExp;
  before?: RegExp;
}

/** Grammar: rules run in order; comment openers beat `identifier`. */
export interface LexicalGrammar {
  identifier?: RegExp;
  keys: readonly KeyPattern[];
  rules: readonly LexicalRule[];
}

/** Matched token treatment: comments skipped, strings count only as keys. */
export type LexicalKind = "comment" | "identifier" | "string";

/** One token kind, matched whole; first capture group is content. */
export interface LexicalRule {
  kind: LexicalKind;
  pattern: RegExp;
}

/** Token read at a position: its length and name. */
export interface LexicalToken {
  identifier?: string | undefined;
  length: number;
}
