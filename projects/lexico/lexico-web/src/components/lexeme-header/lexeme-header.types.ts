// 🏷️ Types

/**
 * A lexeme's inflection from the API. Which fields are filled depends on the part of speech.
 */
export interface LexemeInflection {
  adverbType?: null | string;
  case?: null | string;
  conjugation?: null | string;
  declension?: null | string;
  degree?: null | string;
  gender?: null | string;
  other?: null | string;
}
