import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@codebase/components-web";

import { FormsTable } from "./forms-table";

import type { ReactNode } from "react";

// ♟️ Constants

const CASES = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "ablative",
  "vocative",
];

const GENDERS = ["masculine", "feminine", "neuter"];

const NUMBERS = ["singular", "plural"];

// 🔖 Type

/**
 * One form of an adjective and the word written for it.
 */
export interface AdjectiveFormRow {
  case?: string;
  gender?: string;
  number?: string;
  word: string;
}

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
      <Tabs
        onValueChange={(value) => {
          setSelectedGender(String(value));
        }}
        value={gender}
      >
        <TabsList>
          {genders.map((tab) => (
            <TabsTrigger
              key={tab}
              className="capitalize"
              value={tab}
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <FormsTable
        columns={NUMBERS.map((number) => ({ key: number, label: number }))}
        lookup={(case_, number) =>
          genderRows
            .filter((row) => row.case === case_ && row.number === number)
            .map((row) => row.word)
        }
        rows={cases.map((case_) => ({ key: case_, label: case_ }))}
      />
    </div>
  );
}
