// ♟️ Constants

export const FINITE_KIND = "FiniteVerbForm";

export const MOODS = ["indicative", "subjunctive", "imperative"];

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

/** The tenses of infinitives and participles, in table order. */
export const NON_FINITE_TENSES = ["present", "perfect", "future"];

/** The cases a gerund or supine has, in table order. */
export const VERBAL_NOUN_CASES = [
  "genitive",
  "dative",
  "accusative",
  "ablative",
];

/** Gerund and supine forms, each as its table column. */
export const VERBAL_NOUN_KINDS: Readonly<Record<string, string>> = {
  GerundForm: "gerund",
  SupineForm: "supine",
};

/** Column of a gerund or supine form, and a section's heading. */
export const NON_FINITE_HEADINGS = {
  infinitive: "infinitives",
  participle: "participles",
  verbalNoun: "gerund and supine",
};
