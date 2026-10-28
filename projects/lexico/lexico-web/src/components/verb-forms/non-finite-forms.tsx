import { FINITE_KIND, NON_FINITE_NAMES } from "./verb-forms.constants";

import type { VerbFormRow } from "./verb-forms.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Every form of a verb, of which the ones without a person are listed.
 */
export interface NonFiniteFormsProperties {
  className?: string;
  rows: VerbFormRow[];
}

// 🧩 Component

/**
 * The forms that have no person, such as infinitives, participles, gerunds and
 * supines, each named for its kind and what sets it apart.
 */
export function NonFiniteForms(
  properties: Readonly<NonFiniteFormsProperties>,
): ReactNode {
  const { className, rows } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const nonFinite = rows.filter((row) => row.kind !== FINITE_KIND);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="non-finite-forms"
    >
      <dl className="space-y-1 pt-3 text-sm">
        {nonFinite.map((row) => (
          <div
            key={`${row.kind}${row.tense}${row.voice}${row.case}${row.word}`}
            className="flex justify-between gap-4"
          >
            <dt className="text-muted-foreground capitalize">
              {[
                NON_FINITE_NAMES[row.kind] ?? row.kind,
                row.tense,
                row.voice,
                row.case,
              ]
                .filter(Boolean)
                .join(" ")
                .replaceAll(/([A-Z])/gu, " $1")
                .toLowerCase()}
            </dt>
            <dd>{row.word}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
