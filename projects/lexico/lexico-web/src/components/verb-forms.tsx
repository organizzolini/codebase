import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@codebase/components-web";

import { FormsTable } from "./forms-table";

import type { ReactNode } from "react";

// ♟️ Constants

const FINITE_KIND = "FiniteVerbForm";

const MOODS = ["indicative", "subjunctive", "imperative"];

const NON_FINITE_TAB = "non-finite";

const NUMBER_AXES = ["singular", "plural"].map((number) => ({
  key: number,
  label: number,
}));

const PERSON_AXES = ["first", "second", "third"].map((person) => ({
  key: person,
  label: `${person} person`,
}));

const TENSES = [
  "present",
  "imperfect",
  "future",
  "perfect",
  "pluperfect",
  "futurePerfect",
];

const VOICES = ["active", "passive"];

/**
 * What each kind of non-finite form is called.
 */
const NON_FINITE_NAMES: Readonly<Record<string, string>> = {
  GerundForm: "gerund",
  InfinitiveForm: "infinitive",
  ParticipleForm: "participle",
  SupineForm: "supine",
};

// 🔖 Type

/**
 * One form of a verb and the word written for it. Which fields are filled
 * depends on the kind of form: a finite form has a mood, tense, voice, person
 * and number, an infinitive or participle a tense and voice, and a gerund or
 * supine a case.
 */
export interface VerbFormRow {
  case?: string;
  kind: string;
  mood?: string;
  number?: string;
  person?: string;
  tense?: string;
  voice?: string;
  word: string;
}

/**
 * The properties VerbForms accepts.
 */
export interface VerbFormsProperties {
  className?: string;
  rows: VerbFormRow[];
}

/**
 * The properties AxisTabs accepts.
 */
interface AxisTabsProperties {
  onChange: (value: string) => void;
  options: string[];
  value: string | undefined;
}

/**
 * What the tabs have narrowed a conjugation down to.
 */
interface Conjugation {
  mood: string | undefined;
  moods: string[];
  tense: string | undefined;
  tenseRows: VerbFormRow[];
  tenses: string[];
  voice: string | undefined;
  voices: string[];
}

/**
 * The tabs' current choices.
 */
interface Selection {
  mood: string;
  tense: string;
  voice: string;
}

// 🧩 Component

/**
 * A verb's conjugation: tabs for voice, then mood, then tense, over a table of
 * its words by person and number, and a last tab for the forms that have no
 * person, such as infinitives and participles. A tab keeps its choice when the
 * tab above it changes, as long as the new one has it.
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
      <div className="space-y-2">
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

// 🔏 Private Functions

/**
 * One row of tabs for a single axis of the conjugation, such as its moods.
 */
function AxisTabs(properties: Readonly<AxisTabsProperties>): ReactNode {
  const { onChange, options, value } = properties;

  if (options.length === 0) {
    return undefined;
  }

  return (
    <Tabs
      onValueChange={(next) => {
        onChange(String(next));
      }}
      value={value}
    >
      <TabsList className="h-auto max-w-full flex-wrap justify-start gap-0.5 group-data-horizontal/tabs:h-auto">
        {options.map((option) => (
          <TabsTrigger
            key={option}
            className="flex-none px-1.5 text-xs capitalize"
            value={option}
          >
            {option.replaceAll(/([A-Z])/gu, " $1").toLowerCase()}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

/**
 * Narrows a conjugation down by the voice, mood and tense chosen. Each choice
 * holds only while the rows above it still have it, and otherwise falls back to
 * the first the rows do have.
 */
function narrow(rows: VerbFormRow[], selection: Selection): Conjugation {
  const finite = rows.filter((row) => row.kind === FINITE_KIND);
  const hasNonFinite = finite.length < rows.length;
  const voices = [
    ...VOICES.filter((voice) => finite.some((row) => row.voice === voice)),
    ...(hasNonFinite ? [NON_FINITE_TAB] : []),
  ];
  const voice = pick(voices, selection.voice);
  const voiceRows = finite.filter((row) => row.voice === voice);
  const moods = MOODS.filter((mood) =>
    voiceRows.some((row) => row.mood === mood),
  );
  const mood = pick(moods, selection.mood);
  const moodRows = voiceRows.filter((row) => row.mood === mood);
  const tenses = TENSES.filter((tense) =>
    moodRows.some((row) => row.tense === tense),
  );
  const tense = pick(tenses, selection.tense);

  return {
    mood,
    moods,
    tense,
    tenseRows: moodRows.filter((row) => row.tense === tense),
    tenses,
    voice,
    voices,
  };
}

/**
 * The forms that have no person, such as infinitives, participles, gerunds and
 * supines, each named for its kind and what sets it apart.
 */
function NonFiniteForms(
  properties: Readonly<{ rows: VerbFormRow[] }>,
): ReactNode {
  const nonFinite = properties.rows.filter((row) => row.kind !== FINITE_KIND);

  return (
    <dl className="space-y-1 text-sm">
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
  );
}

/**
 * Keeps the selected option when the options still offer it, and otherwise
 * falls back to the first.
 */
function pick(options: string[], selected: string): string | undefined {
  return options.includes(selected) ? selected : options[0];
}
