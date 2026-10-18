import { Badge, cn } from "@codebase/interface";

import type { ReactNode } from "react";

// ♟️ Constants

/**
 * The short forms grammar books use for the words the API names forms with.
 * Words with no short form, such as "person", are left out of an identifier.
 */
export const ABBREVIATIONS: Readonly<Record<string, string>> = {
  ablative: "ABL",
  accusative: "ACC",
  active: "ACT",
  dative: "DAT",
  feminine: "FEM",
  first: "1ST",
  future: "FUT",
  futurePerfect: "FUTP",
  genitive: "GEN",
  imperative: "IMP",
  imperfect: "IMPF",
  indicative: "IND",
  infinitive: "INF",
  locative: "LOC",
  masculine: "MASC",
  neuter: "NEUT",
  nominative: "NOM",
  passive: "PASS",
  perfect: "PERF",
  pluperfect: "PLUP",
  plural: "PL",
  present: "PRES",
  second: "2ND",
  singular: "SG",
  subjunctive: "SUBJ",
  third: "3RD",
  vocative: "VOC",
};

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
