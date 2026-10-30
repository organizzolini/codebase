// ♟️ Constants

/**
 * The parts of speech whose inflection is described by declension and
 * gender, as an adjective's is.
 */
export const DECLINED_PARTS_OF_SPEECH: ReadonlySet<string> = new Set([
  "adjective",
  "numeral",
  "participle",
  "suffix",
]);

/**
 * The parts of speech whose inflection is described as a noun's.
 */
export const NOMINAL_PARTS_OF_SPEECH: ReadonlySet<string> = new Set([
  "noun",
  "properNoun",
]);
