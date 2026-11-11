// 🏷️ Types

/** `Lexeme` word junction rows, reached from the word side instead. */
export type LexemeDatabaseOnlyField = "wordLexemes";

/** The `Lexeme` relations the API exposes, each as its own GraphQL type. */
export type LexemeRelationField =
  | "forms"
  | "inflection"
  | "principalParts"
  | "pronunciations"
  | "translations";

/** The `PrincipalPart` column the API omits: its lexeme join. */
export type PrincipalPartDatabaseOnlyField = "lexeme";

/** The `Pronunciation` column the API omits: its lexeme join. */
export type PronunciationDatabaseOnlyField = "lexeme";

/** `Translation` columns the API omits: lexeme join, search vector. */
export type TranslationDatabaseOnlyField =
  | "lexeme"
  | "translationFullTextSearch";
