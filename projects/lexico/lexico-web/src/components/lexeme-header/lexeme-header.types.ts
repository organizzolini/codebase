// 🏷️ Types

/**
 * The inflection of a lexeme as the API reports it. Which fields are filled
 * depends on the part of speech: a noun has a declension and gender, a verb a
 * conjugation, and so on.
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
