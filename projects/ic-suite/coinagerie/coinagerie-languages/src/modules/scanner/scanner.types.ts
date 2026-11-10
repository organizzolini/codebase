// 🏷️ Types

/**
 * What makes a quoted string a key. `after` is tested where the string ends;
 * `before`, if given, sees the line's text before it.
 */
export interface KeyPattern {
  after: RegExp;
  before?: RegExp;
}

/**
 * Language grammar. Rules are tried in order, so comment openers win over
 * `identifier`. With no `identifier`, only quoted keys are read.
 */
export interface LexicalGrammar {
  identifier?: RegExp;
  keys: readonly KeyPattern[];
  rules: readonly LexicalRule[];
}

/**
 * How the vocabulary treats a matched token. Comments are skipped; quoted
 * identifiers count by content; strings count only as keys.
 */
export type LexicalKind = "comment" | "identifier" | "string";

/**
 * One token kind, matched whole. A stray quote cannot swallow more than the
 * language's syntax; the first capture group is the content.
 */
export interface LexicalRule {
  kind: LexicalKind;
  pattern: RegExp;
}

/** One token read at a position: how far it reaches, and the name it spells. */
export interface LexicalToken {
  identifier?: string | undefined;
  length: number;
}
