import type { EventMetric } from "../inputs/event-metric.entities";

// 🏷️ Types

/** A measure counted apart: its distinct values multiply the rows. */
export type EventDistinctMeasure = "tags";

/** A figure a group's events add up to, before any metric. */
export type EventMeasure =
  | "clippedSeconds"
  | "coveredClippedSeconds"
  | "coveredSeconds"
  | "days"
  | "events"
  | "firstStart"
  | "instants"
  | "lastStart"
  | "longestSeconds"
  | "medianSeconds"
  | "names"
  | "periodSeconds"
  | "progressiveClippedSeconds"
  | "progressiveCoveredClippedSeconds"
  | "progressiveSeconds"
  | "seconds"
  | "shortestSeconds"
  | "spans"
  | "tags";

/** A group's measures; one the statement did not select is absent. */
export type EventMeasureValues = Readonly<
  Partial<Record<EventMeasure, null | number>>
>;

/** A metric as a calculation over measures and other metrics. */
export interface EventMetricDefinition {
  compute: (
    measures: EventMeasureValues,
    metric: EventMetricReader,
  ) => null | number;
  /** The measures the calculation reads. */
  measures: readonly EventMeasure[];
  /** The metrics the calculation reads. */
  metrics: readonly EventMetric[];
}

/** Reads another metric's value, computing it first. */
export type EventMetricReader = (metric: EventMetric) => null | number;
