import type { EventMetric } from "../../../graphql/generated/operations";

// 🏷️ Types

/**
 * The metrics of the whole set and of each group.
 */
export interface EventMetricsData {
  groups: readonly MetricGroup[];
  timezone: string;
  total: readonly MetricValue[];
}

/**
 * A metric's change against the previous period.
 */
export interface MetricChange {
  direction: MetricDirection;
  /**
   * The change as a percent of the previous value, one decimal; null when the previous was zero or unknown.
   */
  percent: null | number;
  /**
   * The percent as text with its sign, such as `+3.1%`; empty without one.
   */
  percentText: string;
  /**
   * The change in the metric's own units, such as `+12 events`; empty when there is no previous.
   */
  text: string;
}

/**
 * What a metric is called, drawn, and how it adds up.
 */
export interface MetricDescriptor {
  /**
   * Whether a group's value is the sum of its subgroups' values.
   */
  additive: boolean;
  /**
   * What the metric counts, in a sentence.
   */
  description: string;
  format: MetricFormat;
  /**
   * A lucide icon's slug.
   */
  icon: string;
  label: string;
  shortLabel: string;
  /**
   * What a count is of, plural, for a change such as `+12 events`.
   */
  unit: string;
}

/**
 * Which way a metric moved against the previous period.
 */
export type MetricDirection = "down" | "flat" | "up";

/**
 * How a metric's number is written.
 */
export type MetricFormat =
  | "count"
  | "duration"
  | "hours"
  | "instant"
  | "percent";

/**
 * A group of the metrics tree: its values and its subgroups.
 */
export interface MetricGroup {
  children?: readonly MetricGroup[];
  /**
   * The table's group id: its parent's, then the level and key.
   */
  id: string;
  key: null | string;
  label: string;
  level: number;
  path: null | string;
  rank: null | string;
  values: readonly MetricValue[];
}

/**
 * A group the tree shows now: one no open group replaces.
 */
export interface MetricNode {
  /**
   * The groups above it, outermost first, all open.
   */
  ancestors: readonly MetricGroup[];
  group: MetricGroup;
  /**
   * Whether it has subgroups it could open into.
   */
  isExpandable: boolean;
}

/**
 * What the table's shared state is told of a tree.
 */
export interface MetricTreeIds {
  firstPath: readonly string[];
  groupIds: readonly string[];
  groupLevels: readonly number[];
}

/**
 * A metric and a group's number for it, and the previous period's.
 */
export interface MetricValue {
  metric: EventMetric;
  previous: null | number;
  value: null | number;
}
