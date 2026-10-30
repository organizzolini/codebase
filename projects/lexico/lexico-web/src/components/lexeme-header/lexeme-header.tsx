import { CardDescription, CardHeader, CardTitle } from "@codebase/presentation";

import { describeInflection } from "./lexeme-header.utilities";

import type { LexemeInflection } from "./lexeme-header.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties LexemeHeader accepts.
 */
export interface LexemeHeaderProperties {
  className?: string;
  inflection?: LexemeInflection | null | undefined;
  lemma: string;
  partOfSpeech: string;
  principalParts: string[];
}

// 🧩 Component

/**
 * The top of a lexeme card: its principal parts, or its lemma when none were
 * ingested, over its part of speech and inflection, such as "noun, first
 * declension, feminine".
 */
export function LexemeHeader(
  properties: Readonly<LexemeHeaderProperties>,
): ReactNode {
  const { className, inflection, lemma, partOfSpeech, principalParts } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup
  const title = principalParts.length === 0 ? lemma : principalParts.join(", ");
  // The API names parts of speech in camel case, such as `properNoun`.
  const partOfSpeechWords = partOfSpeech
    .replaceAll(/([A-Z])/gu, " $1")
    .toLowerCase();
  const details = [
    partOfSpeechWords,
    ...describeInflection(partOfSpeech, inflection),
  ];

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-header"
    >
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{details.join(", ")}</CardDescription>
      </CardHeader>
    </div>
  );
}
