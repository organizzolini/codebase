import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@codebase/components-web";

import type { ReactNode } from "react";

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

  // 🏗 Setup
  const principalParts = result.principalParts.join(", ");

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
            <Badge variant="secondary">{result.partOfSpeech}</Badge>
          </CardTitle>
          {principalParts === "" ? undefined : (
            <CardDescription>{principalParts}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ol className="list-inside list-decimal space-y-1 text-sm">
            {result.translations.map((translation) => (
              <li key={translation}>{translation}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
