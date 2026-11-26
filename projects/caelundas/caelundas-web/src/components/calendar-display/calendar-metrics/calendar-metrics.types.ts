import type { EventMetricCatalogQuery } from "../../../graphql/generated/operations";
import type { MetricViewName } from "../events-calendar/components/calendar-views/calendar-views.types";

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
 * The loaded catalog: metrics by position and slug, and layout defaults.
 */
export interface MetricCatalog {
  bySlug: ReadonlyMap<string, MetricDescriptor>;
  /**
   * The slugs each metric layout opens with, in order.
   */
  defaults: Readonly<Record<MetricViewName, readonly string[]>>;
  measures: readonly MetricMeasure[];
  /**
   * Every metric, in the order the picker lists it.
   */
  metrics: readonly MetricDescriptor[];
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
 * A metric as the API catalog describes it.
 */
export type MetricDescriptor =
  EventMetricCatalogQuery["eventMetricCatalog"]["metrics"][number];

/**
 * Which way a metric moved against the previous period.
 */
export type MetricDirection = "down" | "flat" | "up";

/**
 * A group of the metrics tree: its values and its subgroups.
 */
export interface MetricGroup {
  children?: readonly MetricGroup[];
  /**
   * The table's group id: its parent's, then the level and key.
   */
  id: string;
  /**
   * A child tag the API added, no group of the table.
   */
  isPreview?: boolean;
  key: null | string;
  label: string;
  level: number;
  path: null | string;
  rank: null | string;
  values: readonly MetricValue[];
}

/**
 * A measure the API stores, which metrics draw on.
 */
export type MetricMeasure =
  EventMetricCatalogQuery["eventMetricCatalog"]["measures"][number];

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
  /**
   * The metric's slug in the catalog.
   */
  metric: string;
  previous: null | number;
  value: null | number;
}
