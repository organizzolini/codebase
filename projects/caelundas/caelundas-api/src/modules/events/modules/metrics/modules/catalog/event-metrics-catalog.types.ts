import type {
  AGGREGATE_KINDS,
  EXPRESSION_OPERATORS,
  measureRowSchema,
  METRIC_UNITS,
  metricRowDataSchema,
} from "./event-metrics-catalog.constants";
import type { z } from "zod";

// 🏷️ Types

/** How a measure's rows combine. */
export type AggregateKind = (typeof AGGREGATE_KINDS)[number];

/** A thing measured about a group of events. */
export interface CatalogMeasure {
  aggregate: AggregateKind;
  argument: null | number;
  conditionColumn: null | string;
  factsColumn: null | string;
  grains: readonly string[];
  icon: string;
  id: string;
  name: string;
  note: string;
  slug: string;
  unit: MetricUnit;
}

/** A metric: what the interface shows, and the expression that computes it. */
export interface CatalogMetric {
  /** Derived: its expression is one summed measure. */
  additive: boolean;
  expression: ExpressionNode;
  icon: string;
  id: string;
  name: string;
  note: string;
  slug: string;
  unit: MetricUnit;
  /** Derived: its expression reads 0 over no events. */
  zeroIfEmpty: boolean;
}

/** What a node is built against: children and slugs. */
export interface ExpressionContext {
  children: ReadonlyMap<string, readonly ExpressionRow[]>;
  measures: ReadonlyMap<string, string>;
  metrics: ReadonlyMap<string, string>;
}

/** One node of an expression tree, its references resolved by slug. */
export type ExpressionNode =
  | { kind: "measure"; slug: string }
  | { kind: "metric"; slug: string }
  | {
      kind: "operator";
      operands: readonly ExpressionNode[];
      operator: ExpressionOperator;
    };

/** An operator an expression node may name. */
export type ExpressionOperator = keyof typeof EXPRESSION_OPERATORS;

/** One node of the `metric_expressions` table, as its tree holds it. */
export interface ExpressionRow {
  id: string;
  kind: string;
  measure_id: null | string;
  /** The metric a metric node reads. */
  metric_id: null | string;
  operator: null | string;
  parent_id: null | string;
  position: number;
}

/** One row of the `measures` table. */
export type MeasureRow = z.infer<typeof measureRowSchema>;

/** The measures and the metrics, each by its slug. */
export interface MetricCatalog {
  measures: ReadonlyMap<string, CatalogMeasure>;
  metrics: ReadonlyMap<string, CatalogMetric>;
}

/** The rows a catalog is built from. */
export interface MetricCatalogRows {
  eventColumns: ReadonlySet<string>;
  expressions: ExpressionRow[];
  measures: MeasureRow[];
  metrics: MetricRow[];
}

/** One row of the `metrics` table. */
export type MetricRow = z.infer<typeof metricRowDataSchema>;

/** The unit a value is measured in. */
export type MetricUnit = (typeof METRIC_UNITS)[number];
