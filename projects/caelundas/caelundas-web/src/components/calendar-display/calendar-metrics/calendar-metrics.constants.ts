import type { EventMetricUnit } from "../../../graphql/generated/operations";

// ♟️ Constants

/**
 * The slugs each metric layout opens with, in order.
 */
export const DEFAULT_METRICS: Readonly<
  Record<"charts" | "totals", readonly string[]>
> = {
  charts: ["events", "unique-names", "duration"],
  totals: [
    "events",
    "unique-names",
    "unique-tags",
    "days-with-events",
    "duration",
    "average-duration",
    "longest-duration",
  ],
};

/**
 * The picker's branches, one for each unit.
 */
export const METRIC_BRANCHES = [
  { icon: "hash", label: "Counts", unit: "COUNT", value: "branch:counts" },
  {
    icon: "timer",
    label: "Durations",
    unit: "DURATION",
    value: "branch:durations",
  },
  {
    icon: "percent",
    label: "Share of time",
    unit: "NONE",
    value: "branch:shares",
  },
  {
    icon: "calendar-clock",
    label: "Times",
    unit: "INSTANT",
    value: "branch:times",
  },
] as const satisfies readonly {
  icon: string;
  label: string;
  unit: EventMetricUnit;
  value: string;
}[];

/** Old and renamed metric slugs, so old links open. */
export const OLD_METRIC_ALIASES: Readonly<Record<string, string>> = {
  AVERAGE_DURATION_MINUTES: "average-duration",
  COVERED_MINUTES: "covered-duration",
  COVERED_PERCENT: "covered-percent",
  DAYS_WITH_EVENTS: "days-with-events",
  EVENTS: "events",
  FIRST_START: "first-start",
  INSTANTS: "perfective-events",
  instants: "perfective-events",
  LAST_START: "last-start",
  LONGEST_DURATION_MINUTES: "longest-duration",
  MEDIAN_DURATION_MINUTES: "median-duration",
  "progressive-duration": "duration",
  PROGRESSIVE_COVERED_PERCENT: "progressive-covered-percent",
  PROGRESSIVE_HOURS: "duration",
  PROGRESSIVE_TOTAL_PERCENT: "progressive-total-percent",
  SHORTEST_DURATION_MINUTES: "shortest-duration",
  SPANS: "progressive-events",
  spans: "progressive-events",
  "total-duration": "duration",
  TOTAL_DURATION_MINUTES: "duration",
  TOTAL_TIME_PERCENT: "total-time-percent",
  UNIQUE_NAMES: "unique-names",
  UNIQUE_TAGS: "unique-tags",
};

/**
 * What a metric's slug looks like: lowercase words joined by hyphens.
 */
export const METRIC_SLUG_PATTERN = /^[a-z][\da-z]*(?:-[\da-z]+)*$/u;

/**
 * Formats an instant's date and time, by zone.
 */
export const INSTANT_FORMATS = new Map<string, Intl.DateTimeFormat>();

/**
 * Writes counts with a thousands separator.
 */
export const COUNT_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/**
 * Writes a percent with at most one decimal.
 */
export const PERCENT_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

/**
 * Writes a share of time with one decimal.
 */
export const SHARE_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

/**
 * What an unknown number reads as.
 */
export const EMPTY_VALUE = "–";

/**
 * Milliseconds in a minute.
 */
export const MINUTE_MILLISECONDS = 60_000;
