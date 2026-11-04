// 🏷️ Types

/**
 * What makes a quoted string a key rather than a value.
 *
 * `after` is sticky and tested where the string ends; `before`, when given, is
 * tested against the text from the start of the line to the string, so a
 * pattern can tell `["key"]` at the head of a TOML table from the same
 * characters closing an array value.
 */
export interface KeyPattern {
  after: RegExp;
  before?: RegExp;
}

/**
 * Everything the scanner needs to know about one language.
 *
 * The rules are tried in order at every position, ahead of the bare
 * `identifier` pattern, so a prefix or a comment opener always wins over the
 * name it would otherwise start. A grammar with no `identifier` reads only
 * quoted keys.
 */
export interface LexicalGrammar {
  identifier?: RegExp;
  keys: readonly KeyPattern[];
  rules: readonly LexicalRule[];
}

/**
 * What a matched token is to the vocabulary.
 *
 * A `comment` is skipped, whatever it holds. An `identifier` is a name written
 * in quotes — a SQL `"table"` — and contributes its content. A `string` is
 * text and contributes nothing, unless a key separator follows it.
 */
export type LexicalKind = "comment" | "identifier" | "string";

/**
 * One kind of token a language can contain, matched whole.
 *
 * The pattern is sticky and matches the token from its first character to its
 * last, an unterminated one included, so a stray quote can never swallow more
 * than a language's own syntax allows. The first capture group is the token's
 * content, read for an `identifier` and for a `string` that proves to be a
 * key.
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
