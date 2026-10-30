import { AdjectiveForms } from "../adjective-forms/adjective-forms";
import { NounForms } from "../noun-forms/noun-forms";
import { VerbForms } from "../verb-forms/verb-forms";

import { NoForms } from "./no-forms";

import type { LexemeFormRow } from "./lexeme-forms.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A lexeme's part of speech and the forms it was found to have.
 */
export interface FormsOfKindProperties {
  className?: string;
  partOfSpeech: string;
  rows: LexemeFormRow[];
}

// 🧩 Component

/**
 * The table for the kind of forms a lexeme turned out to have, or a note that
 * it has none.
 */
export function FormsOfKind(
  properties: Readonly<FormsOfKindProperties>,
): ReactNode {
  const { className, partOfSpeech, rows } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const adjectival = rows.filter((row) => row.kind === "AdjectivalForm");
  const nominal = rows.filter((row) => row.kind === "NominalForm");
  let table: ReactNode;

  if (partOfSpeech === "verb") {
    table = rows.length === 0 ? <NoForms /> : <VerbForms rows={rows} />;
  } else if (adjectival.length > 0) {
    table = <AdjectiveForms rows={adjectival} />;
  } else {
    table = nominal.length === 0 ? <NoForms /> : <NounForms rows={nominal} />;
  }

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="forms-of-kind"
    >
      {table}
    </div>
  );
}
