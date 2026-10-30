import type { LoadLexemeForms } from "../lexeme-forms/lexeme-forms.types";
import type { LexemeInflection } from "../lexeme-header/lexeme-header.types";
import type { LexemeMatchInfo } from "../lexeme-match/lexeme-match.types";
import type { LexemePronunciation } from "../lexeme-pronunciations/lexeme-pronunciations.types";

// 🏷️ Types

/**
 * One lexeme a search matched, with what a card shows of it.
 */
export interface LexemeResult {
  enclitic?: null | string;
  etymology?: null | string;
  forms?: Awaited<ReturnType<LoadLexemeForms>>;
  id: string;
  /** What the matched form is, such as "first person singular present active indicative". */
  identifiers: string[];
  inflection?: LexemeInflection | null;
  lemma: string;
  /** How the search matched this lexeme. */
  match: LexemeMatchInfo;
  partOfSpeech: string;
  principalParts: string[];
  pronunciations: LexemePronunciation[];
  /** How the search matched this lexeme, such as `LEMMA_EXACT` or `WORD_EXACT`. */
  source?: string;
  translations: string[];
}
