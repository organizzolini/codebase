import { FormsTable } from "./forms-table";

import type { ReactNode } from "react";

// ♟️ Constants

/**
 * The cases in the order grammar books list them.
 */
const CASES = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "ablative",
  "vocative",
  "locative",
];

const NUMBERS = ["singular", "plural"];

// 🔖 Type

/**
 * One form of a noun and the word written for it.
 */
export interface NounFormRow {
  case?: string;
  number?: string;
  word: string;
}

/**
 * The properties NounForms accepts.
 */
export interface NounFormsProperties {
  className?: string;
  rows: NounFormRow[];
}

// 🧩 Component

/**
 * A noun's declension: its words by case and number. Cases the noun has no
 * form for are left out.
 */
export function NounForms(
  properties: Readonly<NounFormsProperties>,
): ReactNode {
  const { className, rows } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const cases = CASES.filter((case_) => rows.some((row) => row.case === case_));

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="noun-forms"
    >
      <FormsTable
        columns={NUMBERS.map((number) => ({ key: number, label: number }))}
        lookup={(case_, number) =>
          rows
            .filter((row) => row.case === case_ && row.number === number)
            .map((row) => row.word)
        }
        rows={cases.map((case_) => ({ key: case_, label: case_ }))}
      />
    </div>
  );
}
