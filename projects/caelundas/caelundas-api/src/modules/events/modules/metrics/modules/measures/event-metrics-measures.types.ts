import type {
  AggregateKind,
  CatalogMeasure,
  MetricUnit,
} from "../catalog/event-metrics-catalog.types";

// 🏷️ Types

/** What a metric reads over no events: a number, or none. */
export type EmptyValue = null | number;

/** Where a measure is read: the facts, by day, or the events. */
export type MeasureGrain = "day" | "event";

/** Answers the SQL a statement reads a measure with. */
export type MeasureResolver = (measure: CatalogMeasure) => string;

/** How a measure is computed from the facts, keyed by its slug. */
export interface MeasureSpec {
  aggregate: AggregateKind;
  /** The percentile of a progressive-percentile, 0 to 1. */
  argument?: number | undefined;
  /** The facts column it reads; none for the period. */
  column: null | string;
  /** The boolean facts column that narrows it to events where true. */
  condition?: string | undefined;
  /** The grains that carry it; the rollups read day. */
  grains: readonly MeasureGrain[];
  /** What it is measured in, checked against its row. */
  unit: MetricUnit;
}

/** A measure over the rollup rows. */
export interface RolledMeasure {
  sql: string;
}
