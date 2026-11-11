// 🏷️ Types

/** The `WordForm` relation the API exposes: the form side of the link. */
export type WordFormRelationField = "form";

/** The `WordForm` relation resolvers expose: its word side. */
export type WordFormResolvedField = "word";

/** The `WordLexeme` relation the API exposes: the lexeme side of the link. */
export type WordLexemeRelationField = "lexeme";

/** The `WordLexeme` relation resolvers expose: its word side. */
export type WordLexemeResolvedField = "word";

/** The `Word` relations the API exposes, each as its own GraphQL type. */
export type WordRelationField = "wordForms" | "wordLexemes";
