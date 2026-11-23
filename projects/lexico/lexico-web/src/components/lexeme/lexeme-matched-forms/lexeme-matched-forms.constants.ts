// ♟️ Constants

/** How many readings of the matched forms a card shows before folding the rest into "+N more". */
export const MAXIMUM_SHOWN_READINGS = 3;

/**
 * The grammatical fields of a form row, in the order a reading lists them:
 * mood, voice, tense, case, number, person, gender, degree.
 */
export const READING_FIELDS = [
  "mood",
  "voice",
  "tense",
  "case",
  "number",
  "person",
  "gender",
  "degree",
] as const;
