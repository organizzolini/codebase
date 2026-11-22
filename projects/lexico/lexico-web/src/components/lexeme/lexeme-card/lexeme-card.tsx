import { Card, CardContent, Separator } from "@codebase/presentation";

import { LexemeEtymology } from "../lexeme-etymology/lexeme-etymology";
import { LexemeForms } from "../lexeme-forms/lexeme-forms";
import { LexemeHeader } from "../lexeme-header/lexeme-header";
import { LexemeIdentifiers } from "../lexeme-identifiers/lexeme-identifiers";
import { LexemeMatch } from "../lexeme-match/lexeme-match";
import { LexemePronunciations } from "../lexeme-pronunciations/lexeme-pronunciations";
import { LexemeTranslations } from "../lexeme-translations/lexeme-translations";

import { FORM_MATCHES } from "./lexeme-card.constants";

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
 * One dictionary entry: its parts, inflection, pronunciation, meaning, and origin, plus the matched inflected form, if any.
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
        <Separator />
        <CardContent>
          {matchedForm && (
            <LexemeIdentifiers
              enclitic={result.enclitic}
              identifiers={result.identifiers}
            />
          )}
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
