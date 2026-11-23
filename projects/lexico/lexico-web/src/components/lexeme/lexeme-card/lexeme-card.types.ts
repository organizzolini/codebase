import type { LoadLexemeForms } from "../lexeme-forms/lexeme-forms.types";
import type { LexemeInflection } from "../lexeme-header/lexeme-header.types";
import type { LexemeMatchInfo } from "../lexeme-match/lexeme-match.types";
import type { MatchedForm } from "../lexeme-matched-forms/lexeme-matched-forms.types";
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
  inflection?: LexemeInflection | null;
  lemma: string;
  /** How the search matched this lexeme. */
  match: LexemeMatchInfo;
  /** The written forms the search matched, each with its readings. */
  matchedForms: MatchedForm[];
  partOfSpeech: string;
  principalParts: string[];
  pronunciations: LexemePronunciation[];
  /** How the search matched this lexeme, such as `LEMMA_EXACT` or `WORD_EXACT`. */
  source?: string;
  translations: string[];
}
