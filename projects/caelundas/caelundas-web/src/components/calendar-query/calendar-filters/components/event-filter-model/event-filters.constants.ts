/**
 * Prefix of every tag field's id, naming its tag root.
 */
export const TAG_FIELD_PREFIX = "tag:";

/**
 * Tag operators; a tag also matches every node beneath it.
 */
export const TAG_OPERATORS = {
  hasAllOf: "has_all_of",
  isAnyOf: "is_any_of",
  isNoneOf: "is_none_of",
} as const;

/**
 * Ids of fields derived from event columns, not tags.
 */
export const DERIVED_FIELD_IDS = {
  date: "date",
  durationMinutes: "duration-minutes",
  hour: "hour",
  text: "text",
  weekday: "weekday",
} as const;

/**
 * The builder's name for the tag editor.
 */
export const TAG_OPTIONS_EDITOR = "tag-options";

/**
 * The name the date field's editor is registered under with the builder.
 */
export const DATE_RANGE_EDITOR = "date-range";

/**
 * The operators the derived fields offer, by what they do.
 */
export const DERIVED_OPERATORS = {
  between: "between",
  contains: "contains",
  isAnyOf: "is_any_of",
  isNoneOf: "is_none_of",
  notBetween: "not_between",
  notContains: "not_contains",
} as const;

/**
 * The days of the week, numbered from Sunday, the API's numbering.
 */
export const WEEKDAY_LABELS: readonly string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Numeric field operators: equality, orderings, and a range.
 */
export const NUMBER_OPERATORS = {
  between: "between",
  eq: "eq",
  gt: "gt",
  gte: "gte",
  lt: "lt",
  lte: "lte",
  neq: "neq",
  notBetween: "not_between",
} as const;
