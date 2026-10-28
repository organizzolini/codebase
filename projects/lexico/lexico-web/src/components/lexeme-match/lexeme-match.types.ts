// 🏷️ Types

/**
 * How a search matched a lexeme.
 */
export interface LexemeMatchInfo {
  /** For a fuzzy match, how many edits it is from the query. */
  distance?: number | undefined;
  /** For a headword match on part of a word, how many letters it has beyond the query. */
  extraLetters?: number | undefined;
  kind: LexemeMatchKind;
}

/**
 * The ways a search can match a lexeme.
 */
export type LexemeMatchKind =
  | "contains"
  | "enclitic"
  | "exact-form"
  | "exact-headword"
  | "fuzzy"
  | "prefix"
  | "translation-exact"
  | "translation-prefix";
