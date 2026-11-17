// 🏷️ Types

/** A lexeme's inflection; filled fields depend on part of speech. */
export interface LexemeInflection {
  adverbType?: null | string;
  case?: null | string;
  conjugation?: null | string;
  declension?: null | string;
  degree?: null | string;
  gender?: null | string;
  other?: null | string;
}
