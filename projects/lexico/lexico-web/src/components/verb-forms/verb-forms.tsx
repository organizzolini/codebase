import { useState } from "react";

import { FormsTable } from "../forms-table/forms-table";

import { AxisTabs } from "./axis-tabs";
import { NonFiniteForms } from "./non-finite-forms";
import {
  NON_FINITE_TAB,
  NUMBER_AXES,
  PERSON_AXES,
} from "./verb-forms.constants";
import { narrow } from "./verb-forms.utilities";

import type { Selection, VerbFormRow } from "./verb-forms.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties VerbForms accepts.
 */
export interface VerbFormsProperties {
  className?: string;
  rows: VerbFormRow[];
}

// 🧩 Component

/**
 * Verb conjugation: tabs for voice, mood, and tense over a table of words by person and number, plus a tab for non-person forms.
 */
export function VerbForms(
  properties: Readonly<VerbFormsProperties>,
): ReactNode {
  const { className, rows } = properties;

  // 🪝 Hooks
  const [selection, setSelection] = useState<Selection>({
    mood: "indicative",
    tense: "present",
    voice: "active",
  });

  // 🏗 Setup
  const { mood, moods, tense, tenseRows, tenses, voice, voices } = narrow(
    rows,
    selection,
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="verb-forms"
    >
      <div>
        <AxisTabs
          onChange={(next) => {
            setSelection({ ...selection, voice: next });
          }}
          options={voices}
          value={voice}
        />
        {voice === NON_FINITE_TAB ? (
          <NonFiniteForms rows={rows} />
        ) : (
          <>
            <AxisTabs
              onChange={(next) => {
                setSelection({ ...selection, mood: next });
              }}
              options={moods}
              value={mood}
            />
            <AxisTabs
              onChange={(next) => {
                setSelection({ ...selection, tense: next });
              }}
              options={tenses}
              value={tense}
            />
            <FormsTable
              columns={NUMBER_AXES}
              lookup={(person, number) =>
                tenseRows
                  .filter(
                    (row) => row.person === person && row.number === number,
                  )
                  .map((row) => row.word)
              }
              rows={PERSON_AXES}
            />
          </>
        )}
      </div>
    </div>
  );
}
