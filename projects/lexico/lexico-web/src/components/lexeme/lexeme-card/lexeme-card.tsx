import { Card, CardContent } from "@codebase/presentation";

import { LexemeEtymology } from "../lexeme-etymology/lexeme-etymology";
import { LexemeForms } from "../lexeme-forms/lexeme-forms";
import { LexemeHeader } from "../lexeme-header/lexeme-header";
import { LexemeMatch } from "../lexeme-match/lexeme-match";
import { LexemeMatchedForms } from "../lexeme-matched-forms/lexeme-matched-forms";
import { LexemePronunciations } from "../lexeme-pronunciations/lexeme-pronunciations";
import { LexemeTranslations } from "../lexeme-translations/lexeme-translations";

import type { LoadLexemeForms } from "../lexeme-forms/lexeme-forms.types";
import type { LexemeResult } from "./lexeme-card.types";
import type { ReactNode } from "react";

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

// 🧩 Component

/**
 * One dictionary entry: its parts, inflection, pronunciation, meaning, and origin, plus the inflected forms the search matched, if any.
 */
export function LexemeCard(
  properties: Readonly<LexemeCardProperties>,
): ReactNode {
  const { className, loadForms, result } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-card"
    >
      <Card
        className="relative"
        size="sm"
      >
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
        <CardContent>
          <LexemeMatchedForms
            enclitic={result.enclitic}
            matches={result.matchedForms}
          />
          <LexemeTranslations translations={result.translations} />
          <LexemeForms
            lexemeId={result.id}
            loadForms={loadForms}
            partOfSpeech={result.partOfSpeech}
          />
          <LexemePronunciations pronunciations={result.pronunciations} />
          <LexemeEtymology etymology={result.etymology} />
        </CardContent>
      </Card>
    </div>
  );
}
