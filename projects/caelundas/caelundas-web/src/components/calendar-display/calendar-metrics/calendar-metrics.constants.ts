import type { EventMetric } from "../../../graphql/generated/operations";
import type { MetricViewName } from "../events-calendar/components/calendar-views/calendar-views.types";
import type { MetricDescriptor } from "./calendar-metrics.types";

// ♟️ Constants

/**
 * Every metric, in the order the picker lists it.
 */
export const ALL_METRICS: readonly EventMetric[] = [
  "EVENTS",
  "UNIQUE_NAMES",
  "UNIQUE_TAGS",
  "DAYS_WITH_EVENTS",
  "INSTANTS",
  "SPANS",
  "TOTAL_DURATION_MINUTES",
  "COVERED_MINUTES",
  "AVERAGE_DURATION_MINUTES",
  "MEDIAN_DURATION_MINUTES",
  "LONGEST_DURATION_MINUTES",
  "SHORTEST_DURATION_MINUTES",
  "PROGRESSIVE_HOURS",
  "COVERED_PERCENT",
  "TOTAL_TIME_PERCENT",
  "PROGRESSIVE_COVERED_PERCENT",
  "PROGRESSIVE_TOTAL_PERCENT",
  "FIRST_START",
  "LAST_START",
];

/**
 * The metrics each metric layout opens with.
 */
export const DEFAULT_METRICS: Readonly<
  Record<MetricViewName, readonly EventMetric[]>
> = {
  charts: ["EVENTS", "UNIQUE_NAMES", "TOTAL_DURATION_MINUTES"],
  totals: [
    "EVENTS",
    "UNIQUE_NAMES",
    "UNIQUE_TAGS",
    "DAYS_WITH_EVENTS",
    "TOTAL_DURATION_MINUTES",
    "PROGRESSIVE_HOURS",
    "AVERAGE_DURATION_MINUTES",
    "LONGEST_DURATION_MINUTES",
  ],
};

/**
 * The picker's branches: a name, an icon and the metrics beneath.
 */
export const METRIC_BRANCHES = [
  {
    icon: "hash",
    label: "Counts",
    metrics: [
      "EVENTS",
      "UNIQUE_NAMES",
      "UNIQUE_TAGS",
      "DAYS_WITH_EVENTS",
      "INSTANTS",
      "SPANS",
    ],
    value: "branch:counts",
  },
  {
    icon: "timer",
    label: "Durations",
    metrics: [
      "TOTAL_DURATION_MINUTES",
      "COVERED_MINUTES",
      "AVERAGE_DURATION_MINUTES",
      "MEDIAN_DURATION_MINUTES",
      "LONGEST_DURATION_MINUTES",
      "SHORTEST_DURATION_MINUTES",
      "PROGRESSIVE_HOURS",
    ],
    value: "branch:durations",
  },
  {
    icon: "percent",
    label: "Share of time",
    metrics: [
      "COVERED_PERCENT",
      "TOTAL_TIME_PERCENT",
      "PROGRESSIVE_COVERED_PERCENT",
      "PROGRESSIVE_TOTAL_PERCENT",
    ],
    value: "branch:shares",
  },
  {
    icon: "calendar-clock",
    label: "Times",
    metrics: ["FIRST_START", "LAST_START"],
    value: "branch:times",
  },
] as const satisfies readonly {
  icon: string;
  label: string;
  metrics: readonly EventMetric[];
  value: string;
}[];

/**
 * What each metric is called, shows, and how it adds up.
 */
export const METRIC_CATALOG: Readonly<Record<EventMetric, MetricDescriptor>> = {
  AVERAGE_DURATION_MINUTES: {
    additive: false,
    description: "The mean length of the spans; instants have none.",
    format: "duration",
    icon: "ruler",
    label: "Average duration",
    shortLabel: "Average",
    unit: "",
  },
  COVERED_MINUTES: {
    additive: false,
    description:
      "How long at least one span is under way; overlaps count once.",
    format: "duration",
    icon: "layers",
    label: "Time covered",
    shortLabel: "Covered",
    unit: "",
  },
  COVERED_PERCENT: {
    additive: false,
    description:
      "The share of the period at least one event is under way; overlaps count once, so it tops out at 100%.",
    format: "percent",
    icon: "layers",
    label: "Percent of time covered",
    shortLabel: "Covered",
    unit: "",
  },
  DAYS_WITH_EVENTS: {
    additive: false,
    description: "How many calendar days an event starts on.",
    format: "count",
    icon: "calendar-days",
    label: "Days with events",
    shortLabel: "Days",
    unit: "days",
  },
  EVENTS: {
    additive: true,
    description: "How many distinct events there are.",
    format: "count",
    icon: "hash",
    label: "Events",
    shortLabel: "Events",
    unit: "events",
  },
  FIRST_START: {
    additive: false,
    description: "When the earliest event starts.",
    format: "instant",
    icon: "arrow-left-to-line",
    label: "First start",
    shortLabel: "First",
    unit: "",
  },
  INSTANTS: {
    additive: true,
    description: "How many events happen at a moment and last no time.",
    format: "count",
    icon: "circle-dot",
    label: "Instants",
    shortLabel: "Instants",
    unit: "instants",
  },
  LAST_START: {
    additive: false,
    description: "When the latest event starts.",
    format: "instant",
    icon: "arrow-right-to-line",
    label: "Last start",
    shortLabel: "Last",
    unit: "",
  },
  LONGEST_DURATION_MINUTES: {
    additive: false,
    description: "The length of the longest span.",
    format: "duration",
    icon: "arrow-up-to-line",
    label: "Longest duration",
    shortLabel: "Longest",
    unit: "",
  },
  MEDIAN_DURATION_MINUTES: {
    additive: false,
    description:
      "The middle length of the spans, half shorter and half longer.",
    format: "duration",
    icon: "scale",
    label: "Median duration",
    shortLabel: "Median",
    unit: "",
  },
  PROGRESSIVE_COVERED_PERCENT: {
    additive: false,
    description:
      "The share of the period at least one Progressive event is under way; overlaps count once.",
    format: "percent",
    icon: "layers",
    label: "Progressive time covered",
    shortLabel: "Progressive covered",
    unit: "",
  },
  PROGRESSIVE_HOURS: {
    additive: true,
    description:
      "The hours of the events tagged Progressive, which last a while.",
    format: "hours",
    icon: "hourglass",
    label: "Progressive hours",
    shortLabel: "Hours",
    unit: "h",
  },
  PROGRESSIVE_TOTAL_PERCENT: {
    additive: false,
    description:
      "The Progressive events' lengths added up as a share of the period; overlaps count once per event, so it can pass 100%.",
    format: "percent",
    icon: "layers-2",
    label: "Progressive time counted",
    shortLabel: "Progressive counted",
    unit: "",
  },
  SHORTEST_DURATION_MINUTES: {
    additive: false,
    description: "The length of the shortest span.",
    format: "duration",
    icon: "arrow-down-to-line",
    label: "Shortest duration",
    shortLabel: "Shortest",
    unit: "",
  },
  SPANS: {
    additive: true,
    description: "How many events last a while and have a start and an end.",
    format: "count",
    icon: "move-horizontal",
    label: "Spans",
    shortLabel: "Spans",
    unit: "spans",
  },
  TOTAL_DURATION_MINUTES: {
    additive: true,
    description: "The lengths of all the events added up.",
    format: "duration",
    icon: "timer",
    label: "Total duration",
    shortLabel: "Duration",
    unit: "",
  },
  TOTAL_TIME_PERCENT: {
    additive: false,
    description:
      "The events' lengths added up as a share of the period; overlaps count once per event, so it can pass 100%.",
    format: "percent",
    icon: "layers-2",
    label: "Time counted",
    shortLabel: "Counted",
    unit: "",
  },
  UNIQUE_NAMES: {
    additive: false,
    description: "How many different event names there are.",
    format: "count",
    icon: "fingerprint",
    label: "Unique names",
    shortLabel: "Names",
    unit: "names",
  },
  UNIQUE_TAGS: {
    additive: false,
    description: "How many different tags the events carry.",
    format: "count",
    icon: "tags",
    label: "Unique tags",
    shortLabel: "Tags",
    unit: "tags",
  },
};

/**
 * Begins every branch value, so no branch row reads as a metric.
 */
export const METRIC_BRANCH_PREFIX = "branch:";

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
 * Writes hours with one decimal and a thousands separator.
 */
export const HOURS_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
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
