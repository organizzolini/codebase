/**
 * A day as a rule writes it, `YYYY-MM-DD`.
 */
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

/**
 * A number as a rule may write it: an optional sign, digits with an optional
 * fraction or a fraction alone, and an optional exponent, with spaces around.
 */
export const NUMBER_PATTERN =
  /^\s*[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?\s*$/iu;

/**
 * A tag id as Postgres reads a `uuid`, so an id that is not one is dropped
 * before it reaches a cast that would fail the whole query.
 */
export const UUID_PATTERN =
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu;
