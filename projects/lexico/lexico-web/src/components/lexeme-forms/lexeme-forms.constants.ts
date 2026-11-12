// ♟️ Constants

/** Parts of speech with a forms table, and its kind. */
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
