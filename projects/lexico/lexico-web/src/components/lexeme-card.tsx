import { Card, CardContent } from "@codebase/components-web";

import { LexemeEtymology } from "./lexeme-etymology";
import { LexemeForms } from "./lexeme-forms";
import { LexemeHeader } from "./lexeme-header";
import { LexemeIdentifiers } from "./lexeme-identifiers";
import { LexemeMatch } from "./lexeme-match";
import { LexemePronunciations } from "./lexeme-pronunciations";
import { LexemeTranslations } from "./lexeme-translations";

import type { LoadLexemeForms } from "./lexeme-forms";
import type { LexemeInflection } from "./lexeme-header";
import type { LexemeMatchInfo } from "./lexeme-match";
import type { LexemePronunciation } from "./lexeme-pronunciations";
import type { ReactNode } from "react";

// ♟️ Constants

/**
 * The ways a search can match a lexeme through one of its inflected forms, as
 * opposed to its headword, a prefix of it, or a translation: only then is it
 * worth saying which form matched.
 */
const FORM_MATCHES = new Set(["ENCLITIC", "WORD_EXACT"]);

// 🔖 Type

/**
 * The properties LexemeCard accepts.
 */
export interface LexemeCardProperties {
  className?: string;
  /** Loads the forms of a lexeme when its table is first opened. */
  loadForms: LoadLexemeForms;
  result: LexemeResult;
}

/**
 * One lexeme a search matched, with what a card shows of it.
 */
export interface LexemeResult {
  enclitic?: null | string;
  etymology?: null | string;
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

// 🧩 Component

/**
 * One dictionary entry: its principal parts and inflection, how it is
 * pronounced, what it means, where it comes from, and its declension or
 * conjugation. When the search matched an inflected form, it also says which.
 */
export function LexemeCard(
  properties: Readonly<LexemeCardProperties>,
): ReactNode {
  const { className, loadForms, result } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const matchedForm =
    result.source !== undefined && FORM_MATCHES.has(result.source);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-card"
    >
      <Card className="relative w-full shadow-md">
        <LexemeMatch
          className="absolute top-3 right-3"
          match={result.match}
        />
        <LexemeHeader
          className="pr-16"
          inflection={result.inflection}
          lemma={result.lemma}
          partOfSpeech={result.partOfSpeech}
          principalParts={result.principalParts}
        />
        <CardContent className="space-y-3">
          {matchedForm && (
            <LexemeIdentifiers
              enclitic={result.enclitic}
              identifiers={result.identifiers}
            />
          )}
          <LexemeTranslations translations={result.translations} />
          <LexemeForms
            className="border-t pt-3"
            lexemeId={result.id}
            loadForms={loadForms}
            partOfSpeech={result.partOfSpeech}
          />
          <LexemePronunciations
            className="border-t pt-3"
            pronunciations={result.pronunciations}
          />
          <LexemeEtymology
            className="border-t pt-3"
            etymology={result.etymology}
          />
        </CardContent>
      </Card>
    </div>
  );
}
