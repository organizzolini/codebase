import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@codebase/components-web";

import type { ReactNode } from "react";

// ♟️ Constants

/**
 * How many translations a card shows before the rest are folded away, so one
 * entry with dozens of senses cannot dominate the masonry.
 */
const VISIBLE_TRANSLATION_COUNT = 3;

// 🔖 Type

/**
 * The properties LexemeCard accepts.
 */
export interface LexemeCardProperties {
  className?: string;
  result: LexemeResult;
}

/**
 * One dictionary entry as the card shows it.
 */
export interface LexemeResult {
  id: string;
  lemma: string;
  partOfSpeech: string;
  principalParts: string[];
  translations: string[];
}

// 🧩 Component

/**
 * One matched lexeme: its lemma and part of speech, its principal parts, and
 * its English translations.
 */
export function LexemeCard(
  properties: Readonly<LexemeCardProperties>,
): ReactNode {
  const { className, result } = properties;

  // 🪝 Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 🏗 Setup
  const principalParts = result.principalParts.join(", ");
  // The API names parts of speech in camel case, such as `properNoun`.
  const partOfSpeech = result.partOfSpeech
    .replaceAll(/([A-Z])/gu, " $1")
    .toLowerCase();
  const hiddenCount = result.translations.length - VISIBLE_TRANSLATION_COUNT;
  const translations = isExpanded
    ? result.translations
    : result.translations.slice(0, VISIBLE_TRANSLATION_COUNT);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-card"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-2xl">
            {result.lemma}
            <Badge variant="secondary">{partOfSpeech}</Badge>
          </CardTitle>
          {principalParts === "" ? undefined : (
            <CardDescription>{principalParts}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ol className="list-inside list-decimal space-y-1 text-sm">
            {translations.map((translation) => (
              <li key={translation}>{translation}</li>
            ))}
          </ol>
          {hiddenCount > 0 && (
            <Button
              className="mt-2"
              onClick={() => {
                setIsExpanded(!isExpanded);
              }}
              size="sm"
              variant="ghost"
            >
              {isExpanded ? "Show fewer" : `Show ${hiddenCount} more`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
