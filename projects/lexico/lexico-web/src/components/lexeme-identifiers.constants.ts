// ♟️ Constants

/**
 * The short forms grammar books use for the words the API names forms with.
 * Words with no short form, such as "person", are left out of an identifier.
 */
export const ABBREVIATIONS: Readonly<Record<string, string>> = {
  ablative: "ABL",
  accusative: "ACC",
  active: "ACT",
  dative: "DAT",
  feminine: "FEM",
  first: "1ST",
  future: "FUT",
  futurePerfect: "FUTP",
  genitive: "GEN",
  imperative: "IMP",
  imperfect: "IMPF",
  indicative: "IND",
  infinitive: "INF",
  locative: "LOC",
  masculine: "MASC",
  neuter: "NEUT",
  nominative: "NOM",
  passive: "PASS",
  perfect: "PERF",
  pluperfect: "PLUP",
  plural: "PL",
  present: "PRES",
  second: "2ND",
  singular: "SG",
  subjunctive: "SUBJ",
  third: "3RD",
  vocative: "VOC",
};
