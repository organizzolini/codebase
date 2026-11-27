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
  duration: "duration",
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
 * The duration buckets, each a closed range of whole minutes.
 */
export const DURATION_BUCKETS: readonly {
  label: string;
  maximum: number;
  minimum: number;
  value: string;
}[] = [
  { label: "Instant", maximum: 0, minimum: 0, value: "instant" },
  { label: "Minutes", maximum: 59, minimum: 1, value: "minutes" },
  { label: "Hours", maximum: 1439, minimum: 60, value: "hours" },
  { label: "Days", maximum: 10_079, minimum: 1440, value: "days" },
  { label: "Weeks", maximum: 43_199, minimum: 10_080, value: "weeks" },
  {
    label: "Months",
    maximum: Number.MAX_SAFE_INTEGER,
    minimum: 43_200,
    value: "months",
  },
];

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

/**
 * What each tag root means; unlisted roots show their name.
 */
export const TAG_ROOT_DESCRIPTIONS: Readonly<Record<string, string>> = {
  Aspect: "Angles between bodies, and the patterns they form.",
  Body: "The bodies an event involves, grouped by class.",
  Daily: "Events that repeat every day.",
  Eclipse: "Solar and lunar eclipses.",
  Lunar: "The Moon's month and orbit.",
  Planetary: "The planets' own cycles.",
  Sign: "The signs and what they imply.",
  Solar: "The Sun's year.",
  Temporality: "Whether an event is an instant or progresses over time.",
};
