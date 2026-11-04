// ♟️ Constants

/**
 * The parts of speech that have a table of forms, and which kind of table.
 */
export const TABLE_KINDS: Readonly<
  Record<string, "conjugation" | "declension">
> = {
  adjective: "declension",
  determiner: "declension",
  noun: "declension",
  numeral: "declension",
  participle: "declension",
  pronoun: "declension",
  properNoun: "declension",
  suffix: "declension",
  verb: "conjugation",
};
