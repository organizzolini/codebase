import { useState } from "react";

import {
  Frame,
  FramePanel,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@codebase/presentation";

import { FormsTable } from "../forms-table/forms-table";
import {
  FLUSH_PANEL,
  FORMS_FRAME,
  FORMS_TAB,
  FORMS_TAB_LIST,
} from "../forms-table/forms-table.constants";

import { CASES, GENDERS, NUMBERS } from "./adjective-forms.constants";

import type { AdjectiveFormRow } from "./adjective-forms.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties AdjectiveForms accepts.
 */
export interface AdjectiveFormsProperties {
  className?: string;
  rows: AdjectiveFormRow[];
}

// 🧩 Component

/**
 * An adjective's declension: a table of its words by case and number for each
 * gender, switched with tabs.
 */
export function AdjectiveForms(
  properties: Readonly<AdjectiveFormsProperties>,
): ReactNode {
  const { className, rows } = properties;

  // 🪝 Hooks
  const [selectedGender, setSelectedGender] = useState(GENDERS[0]);

  // 🏗 Setup
  const genders = GENDERS.filter((gender) =>
    rows.some((row) => row.gender === gender),
  );
  const gender = genders.includes(selectedGender ?? "")
    ? selectedGender
    : genders[0];
  const genderRows = rows.filter((row) => row.gender === gender);
  const cases = CASES.filter((case_) =>
    genderRows.some((row) => row.case === case_),
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="adjective-forms"
    >
      <Frame
        className={FORMS_FRAME}
        variant="ghost"
        dense
        stacked
      >
        <FramePanel className={FLUSH_PANEL}>
          <Tabs
            onValueChange={(value: unknown) => {
              setSelectedGender(String(value));
            }}
            value={gender}
          >
            <TabsList
              className={FORMS_TAB_LIST}
              variant="line"
            >
              {genders.map((tab) => (
                <TabsTrigger
                  key={tab}
                  className={`${FORMS_TAB} capitalize`}
                  value={tab}
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </FramePanel>
        <FramePanel className={FLUSH_PANEL}>
          <FormsTable
            columns={NUMBERS.map((number) => ({ key: number, label: number }))}
            lookup={(case_, number) =>
              genderRows
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
