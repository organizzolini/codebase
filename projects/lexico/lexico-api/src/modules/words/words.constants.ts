// ♟️ Constants

/** Word lookup joins: its forms, and its lexemes' relations. */
export const WORD_RELATIONS = {
  wordForms: { form: true },
  wordLexemes: {
    lexeme: {
      forms: true,
      inflection: true,
      principalParts: true,
      pronunciations: true,
      translations: true,
    },
  },
} as const;
