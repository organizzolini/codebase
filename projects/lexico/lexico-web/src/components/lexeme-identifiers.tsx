import { Badge, cn } from "@codebase/presentation";

import { ABBREVIATIONS } from "./lexeme-identifiers.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties LexemeIdentifiers accepts.
 */
export interface LexemeIdentifiersProperties {
  className?: string;
  /** The enclitic split off the searched word, such as "que". */
  enclitic?: null | string | undefined;
  /** What the matched form is, such as "first person singular present active indicative". */
  identifiers: string[];
}

// 🧩 Component

/**
 * What the searched word is as a form of this lexeme, such as "1ST SG PRES ACT
 * IND", for when a search matched an inflected form and not the headword.
 */
export function LexemeIdentifiers(
  properties: Readonly<LexemeIdentifiersProperties>,
): ReactNode {
  const { className, enclitic, identifiers } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (identifiers.length === 0 && !enclitic) {
    return undefined;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-identifiers"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {identifiers.map((identifier) => (
          <Badge
            key={identifier}
            aria-label={identifier}
            title={identifier}
            variant="outline"
          >
            {identifier
              .split(" ")
              .flatMap((word) => ABBREVIATIONS[word] ?? [])
              .join(" ")}
          </Badge>
        ))}
        {enclitic && (
          <Badge
            className={cn("normal-case")}
            variant="secondary"
          >
            +{enclitic}
          </Badge>
        )}
      </div>
    </div>
  );
}
