import { Paginated } from "@codebase/interface";

import { LexemeWordFormType } from "../word-forms/lexeme-word-form.entities";
import { WordFormType } from "../word-forms/word-form.entities";
import { WordLexemeType } from "../word-lexemes/word-lexeme.entities";

/** Relay connection for word-form links of one surface word. */
export const WordFormConnectionType = Paginated(WordFormType, "WordForm");

/** Relay connection for word-lexeme links of one surface word. */
export const WordLexemeConnectionType = Paginated(WordLexemeType, "WordLexeme");

/** Relay connection for words reachable from one lexeme's forms. */
export const LexemeWordFormConnectionType = Paginated(
  LexemeWordFormType,
  "LexemeWordForm",
);
