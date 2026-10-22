/**
 * Starts every tag field's id, followed by the id of the tag root it
 * filters, so a rule's path alone says which root it is about.
 */
export const TAG_FIELD_PREFIX = "tag:";

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
 * The rows of the tag view that belong to the event under test and name one
 * of the tags bound in place of `{placeholders}`.
 */
export const EVENT_TAGS_MATCHING_SQL = `
  select t.tag_id
  from calendar_event_tag_nodes t
  where t.calendar_event_id = e.id and t.tag_id in ({placeholders})
`;

/**
 * The ids of the fields derived from each event's own columns rather than
 * from its tags.
 */
export const DERIVED_FIELD_IDS = {
  date: "date",
  duration: "duration",
  durationMinutes: "duration-minutes",
  hour: "hour",
  temporality: "temporality",
  text: "text",
  weekday: "weekday",
} as const;

/**
 * The name the tag fields' editor is registered under with the builder: a
 * searchable list of checkboxes, one for each tag, indented by its depth.
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
 * The days of the week, numbered from Sunday as SQLite numbers them.
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
 * The values the temporality field offers, as the derived view names them.
 */
export const TEMPORALITIES: readonly string[] = ["Instant", "Duration"];

/**
 * The SQL each derived field reads. Times are read in each event's own zone
 * through the local-time functions every executor registers.
 */
export const DERIVED_FIELD_SQL = {
  dateRange: `(event_local_date(e."end", e.timezone) >= ? and event_local_date(e."start", e.timezone) <= ?)`,
  duration: "(e.duration_minutes between ? and ?)",
  durationMinutes: "e.duration_minutes",
  hour: `event_local_hour(e."start", e.timezone)`,
  hourRange: `(event_local_hour(e."start", e.timezone) between ? and ?)`,
  temporality: "e.temporality",
  text: String.raw`(e."summary" like ? escape '\' or e.description like ? escape '\')`,
  weekday: `event_local_weekday(e."start", e.timezone)`,
} as const;

/**
 * The operators a numeric field offers, mirroring the filter builder's own
 * number operators: equality, the four orderings, and a range.
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
 * The number a tag's name ends in, such as the 6 of "Harmonic 6": the name
 * with its non-digit prefix taken away. Only a name that ends in a digit is
 * numeric, so a root such as "Aspect Harmonic" itself never reads as 0.
 */
export const TAG_NUMBER_SQL =
  "cast(replace(t.tag_name, rtrim(t.tag_name, '0123456789'), '') as integer)";

/**
 * The tag nodes of the event under test, beneath one root, whose name ends
 * in a number and meets a condition on that number.
 */
export const EVENT_TAG_NUMBERS_SQL = `
  select 1
  from calendar_event_tag_nodes t
  where t.calendar_event_id = e.id
    and t.tag_root_id = ?
    and t.tag_name glob '*[0-9]'
    and {condition}
`;
