/**
 * A day as a rule writes it, `YYYY-MM-DD`.
 */
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

/** A rule's number, with optional sign, fraction, exponent and spaces. */
export const NUMBER_PATTERN =
  /^\s*[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?\s*$/iu;

/** A tag id cast to uuid; other ids are dropped first. */
export const UUID_PATTERN =
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu;
