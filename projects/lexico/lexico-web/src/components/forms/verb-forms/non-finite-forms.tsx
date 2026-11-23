import { Marker, MarkerContent } from "@codebase/presentation";

import { FormsTable } from "../forms-table/forms-table";

import { nonFiniteSections } from "./verb-forms.utilities";

import type { VerbFormRow } from "./verb-forms.types";
import type { ReactNode } from "react";

// 🔖 Type

/** A verb's forms, with those lacking a person tabled. */
export interface NonFiniteFormsProperties {
  className?: string;
  rows: VerbFormRow[];
}

// 🧩 Component

/**
 * The forms with no person, stacked as tables under a divider each: infinitives
 * and participles by tense and voice, then gerund and supine by case.
 */
export function NonFiniteForms(
  properties: Readonly<NonFiniteFormsProperties>,
): ReactNode {
  const { className, rows } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const sections = nonFiniteSections(rows);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="non-finite-forms"
    >
      {sections.map((section) => (
        <section key={section.label}>
          <Marker className="px-3 py-1">
            <MarkerContent className="capitalize">
              {section.label}
            </MarkerContent>
            <span
              className="min-w-0 flex-1 border-t border-border"
              aria-hidden
            />
          </Marker>
          <FormsTable
            columns={section.columns}
            lookup={section.lookup}
            rows={section.rows}
          />
        </section>
      ))}
    </div>
  );
}
