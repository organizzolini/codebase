import type {
  DurationSpanOptions,
  SpanUnit,
} from "./calendar-metrics-span.types";

// ♟️ Constants

/**
 * The options of an abbreviated span, for tight places.
 */
export const COMPACT_SPAN: DurationSpanOptions = { compact: true };

/**
 * Minutes in a day.
 */
export const DAY_MINUTES = 1440;

/**
 * Hours in a day.
 */
export const DAY_HOURS = 24;

/**
 * What no time at all reads as.
 */
export const ZERO_SPAN = "0 min";

/**
 * The units a span keeps, by compactness: three, else six.
 */
export const DEFAULT_MAX_UNITS: Readonly<Record<"false" | "true", number>> = {
  false: 6,
  true: 3,
};

/**
 * What separates a span's units, by whether they are abbreviated.
 */
export const SPAN_SEPARATORS: Readonly<Record<"false" | "true", string>> = {
  false: ", ",
  true: " ",
};

/**
 * The units, largest first: a month is 30 days, a year 365.
 */
export const SPAN_UNITS: readonly SpanUnit[] = [
  {
    labels: {
      false: { false: "years", true: "year" },
      true: { false: "y", true: "y" },
    },
    minutes: 365 * DAY_MINUTES,
  },
  {
    labels: {
      false: { false: "months", true: "month" },
      true: { false: "mo", true: "mo" },
    },
    minutes: 30 * DAY_MINUTES,
  },
  {
    labels: {
      false: { false: "weeks", true: "week" },
      true: { false: "w", true: "w" },
    },
    minutes: 7 * DAY_MINUTES,
  },
  {
    labels: {
      false: { false: "days", true: "day" },
      true: { false: "d", true: "d" },
    },
    minutes: DAY_MINUTES,
  },
  {
    labels: {
      false: { false: "hours", true: "hour" },
      true: { false: "h", true: "h" },
    },
    minutes: 60,
  },
  {
    labels: {
      false: { false: "minutes", true: "minute" },
      true: { false: "min", true: "min" },
    },
    minutes: 1,
  },
];
