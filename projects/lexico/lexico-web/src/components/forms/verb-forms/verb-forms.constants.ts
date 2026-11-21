// ♟️ Constants

export const FINITE_KIND = "FiniteVerbForm";

export const MOODS = ["indicative", "subjunctive", "imperative"];

export const NON_FINITE_ABBREVIATION = "NONF";

export const NON_FINITE_TAB = "non-finite";

export const NUMBER_AXES = ["singular", "plural"].map((number) => ({
  key: number,
  label: number,
}));

export const PERSON_AXES = ["first", "second", "third"].map((person) => ({
  key: person,
  label: `${person} person`,
}));

export const TENSES = [
  "present",
  "imperfect",
  "future",
  "perfect",
  "pluperfect",
  "futurePerfect",
];

export const VOICES = ["active", "passive"];

/**
 * What each kind of non-finite form is called.
 */
export const NON_FINITE_NAMES: Readonly<Record<string, string>> = {
  GerundForm: "gerund",
  InfinitiveForm: "infinitive",
  ParticipleForm: "participle",
  SupineForm: "supine",
};
