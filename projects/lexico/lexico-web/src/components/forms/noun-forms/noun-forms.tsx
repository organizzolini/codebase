import { Frame, FramePanel } from "@codebase/presentation";

import { FormsTable } from "../forms-table/forms-table";
import { FLUSH_PANEL, FORMS_FRAME } from "../forms-table/forms-table.constants";

import { CASES, NUMBERS } from "./noun-forms.constants";

import type { NounFormRow } from "./noun-forms.types";
import type { ReactNode } from "react";

// 🔖 Type

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
      <Frame
        className={FORMS_FRAME}
        variant="ghost"
        dense
        stacked
      >
        <FramePanel className={FLUSH_PANEL}>
          <FormsTable
            columns={NUMBERS.map((number) => ({ key: number, label: number }))}
            lookup={(case_, number) =>
              rows
                .filter((row) => row.case === case_ && row.number === number)
                .map((row) => row.word)
            }
            rows={cases.map((case_) => ({ key: case_, label: case_ }))}
          />
        </FramePanel>
      </Frame>
    </div>
  );
}
