import type { EventFilterGroup } from "../filtering/event-filter.types";
import type { EventGroupLevel } from "../grouping/event-grouping.types";
import type { EventMetric } from "./modules/inputs/event-metric.entities";
import type { EventMetricGroupEntity } from "./modules/results/event-metric-group.entities";

// 🏷️ Types

/** A metrics statement and the values its placeholders bind. */
export interface CompiledEventMetricsQuery {
  parameters: unknown[];
  sql: string;
}

/** A group in the making: both periods' values. */
export interface EventMetricsDraft {
  current: (null | number)[] | undefined;
  entity: EventMetricGroupEntity;
  parentId: string;
  previous: (null | number)[] | undefined;
}

/** What one metrics statement measures; no level means the whole set. */
export interface EventMetricsQueryRequest {
  filter: EventFilterGroup | null;
  grouping: readonly EventGroupLevel[];
  level?: number;
  metrics: readonly EventMetric[];
  period: MetricsPeriod;
  previous: MetricsPeriod | null;
  tagRoot: null | string;
}

/** One group's metrics in one period, as a statement returns them. */
export interface EventMetricsRow {
  id: string;
  key: null | string;
  label: null | string;
  parentId: string;
  path: null | string;
  period: number;
  rank: null | string;
  values: (null | number)[];
}

/** What the tree is built from. */
export interface EventMetricsTreeSource {
  compare: boolean;
  levels: readonly EventGroupLevel[];
  metrics: readonly EventMetric[];
  names: ReadonlyMap<string, string>;
  rows: readonly (readonly EventMetricsRow[])[];
}

/** A level's lateral join: its grouping, place and key source. */
export interface LevelJoin {
  grouping: readonly EventGroupLevel[];
  index: number;
  source: string;
}

/** A half-open span as the ISO 8601 text Postgres reads. */
export interface MetricsPeriod {
  end: string;
  start: string;
}
