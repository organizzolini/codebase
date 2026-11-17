import type { DerivedGroupId } from "./event-groups.types";

/**
 * The most levels a grouping nests.
 */
export const MAXIMUM_GROUP_LEVELS = 3;

/**
 * The deepest a tag grouping may reach beneath its root.
 */
export const MAXIMUM_GROUP_DEPTH = 16;

/**
 * The ids of the fields derived from each event's start or duration.
 */
export const DERIVED_GROUP_IDS = {
  day: "day",
  duration: "duration",
  hour: "hour",
  month: "month",
  quarter: "quarter",
  week: "week",
  weekday: "weekday",
  year: "year",
} as const;

/**
 * Derived fields in picker order: longest periods, then duration.
 */
export const DERIVED_GROUP_ORDER: readonly DerivedGroupId[] = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "weekday",
  "hour",
  "duration",
];

/**
 * What the picker calls each derived field.
 */
export const DERIVED_GROUP_LABELS: Readonly<Record<DerivedGroupId, string>> = {
  day: "Day",
  duration: "Duration",
  hour: "Hour",
  month: "Month",
  quarter: "Quarter",
  week: "Week",
  weekday: "Weekday",
  year: "Year",
};

/**
 * What each derived field groups by, as the field picker describes it.
 */
export const DERIVED_GROUP_DESCRIPTIONS: Readonly<
  Record<DerivedGroupId, string>
> = {
  day: "The day an event starts on",
  duration: "How long an event lasts, from an instant to months",
  hour: "The hour of the day an event starts in",
  month: "The month an event starts in",
  quarter: "The quarter of the year an event starts in",
  week: "The week, Sunday to Saturday, an event starts in",
  weekday: "The day of the week an event starts on",
  year: "The year an event starts in",
};
