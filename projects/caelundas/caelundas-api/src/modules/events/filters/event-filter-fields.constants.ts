// ♟️ Constants

/**
 * Starts every tag field's id, followed by the id of the tag root it
 * filters, so a rule's path alone says which root it is about.
 */
export const TAG_FIELD_PREFIX = "tag:";

/**
 * The ids of the fields derived from each event's own columns rather than
 * from its tags.
 */
export const CALENDAR_FIELD_IDS = {
  date: "date",
  duration: "duration",
  durationMinutes: "duration-minutes",
  hour: "hour",
  temporality: "temporality",
  text: "text",
  weekday: "weekday",
} as const;

/**
 * The operators a tag field offers. A tag matches every node beneath it,
 * because the tag view carries each event's ancestors.
 */
export const TAG_OPERATORS = {
  hasAllOf: "has_all_of",
  isAnyOf: "is_any_of",
  isNoneOf: "is_none_of",
} as const;

/**
 * The names of the operators a tag field offers.
 */
export const TAG_OPERATOR_NAMES: readonly string[] =
  Object.values(TAG_OPERATORS);

/**
 * The operators the derived fields offer, by what they do.
 */
export const CALENDAR_OPERATORS = {
  between: "between",
  contains: "contains",
  isAnyOf: "is_any_of",
  isNoneOf: "is_none_of",
  notBetween: "not_between",
  notContains: "not_contains",
} as const;

/**
 * The operators a numeric field offers: equality, the four orderings, and a
 * range.
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
 * The SQL comparison each numeric operator but a range stands for; `neq`
 * compares for equality and the rule is then negated.
 */
export const COMPARISONS: Readonly<Record<string, string>> = {
  [NUMBER_OPERATORS.eq]: "=",
  [NUMBER_OPERATORS.gt]: ">",
  [NUMBER_OPERATORS.gte]: ">=",
  [NUMBER_OPERATORS.lt]: "<",
  [NUMBER_OPERATORS.lte]: "<=",
  [NUMBER_OPERATORS.neq]: "=",
};

/**
 * The duration buckets, each a closed range of whole minutes.
 */
export const DURATION_BUCKETS: readonly {
  maximum: number;
  minimum: number;
  value: string;
}[] = [
  { maximum: 0, minimum: 0, value: "instant" },
  { maximum: 59, minimum: 1, value: "minutes" },
  { maximum: 1439, minimum: 60, value: "hours" },
  { maximum: 10_079, minimum: 1440, value: "days" },
  { maximum: 43_199, minimum: 10_080, value: "weeks" },
  { maximum: Number.MAX_SAFE_INTEGER, minimum: 43_200, value: "months" },
];

/**
 * The bounds of the hour of the day.
 */
export const HOURS = { maximum: 23, minimum: 0 } as const;

/**
 * The bounds of the day of the week, numbered from Sunday.
 */
export const WEEKDAYS = { maximum: 6, minimum: 0 } as const;
