import { METRIC_COLUMN_PREFIX } from "../../event-metrics.constants";

import {
  EMPTY_OPERATORS,
  EMPTY_VALUES,
  EVENT_AGGREGATE_SQL,
  EVENT_BASE_COLUMNS,
  EVENT_COLUMN_KINDS,
  OPERATOR_SQL,
  ROLLED_AGGREGATE_SQL,
} from "./event-metrics-measures.constants";

import type {
  CatalogMeasure,
  CatalogMetric,
  ExpressionNode,
  MetricCatalog,
} from "../catalog/event-metrics-catalog.types";
import type {
  EmptyValue,
  MeasureResolver,
  RolledMeasure,
} from "./event-metrics-measures.types";

// 🌎 Public Functions

// Tags are counted apart in the facts, so only the raw events ask for them.
/**
 * The aggregate of a measure over the event rows `alias` names; `tagRoot` limits the tags counted.
 */
export function compileEventAggregate(
  measure: CatalogMeasure,
  alias: string,
  tagRoot = "",
): string {
  const column =
    measure.factsColumn === null ? "" : `${alias}."${measure.factsColumn}"`;
  const condition =
    measure.conditionColumn === null
      ? ""
      : `${alias}."${measure.conditionColumn}"`;
  const sql = EVENT_AGGREGATE_SQL[measure.aggregate]
    .replaceAll("{a}", () => alias)
    .replaceAll("{c}", () => column)
    .replaceAll("{filter}", () =>
      condition === "" ? "" : ` filter (where ${condition})`,
    )
    .replaceAll("{and}", () => (condition === "" ? "" : ` and ${condition}`))
    .replaceAll("{argument}", () => String(measure.argument ?? 0.5))
    .replaceAll("{tagRoot}", () => tagRoot);

  return toUnit(measure, sql);
}

/**
 * The expression as SQL, measures read as `resolve` says; a zero divisor reads none.
 */
export function compileExpression(
  node: ExpressionNode,
  context: Readonly<{ catalog: MetricCatalog; resolve: MeasureResolver }>,
): string {
  if (node.kind === "measure") {
    const measure = context.catalog.measures.get(node.slug);

    return measure === undefined ? "null" : context.resolve(measure);
  }

  if (node.kind === "metric") {
    const metric = context.catalog.metrics.get(node.slug);

    return metric === undefined
      ? "null"
      : compileExpression(metric.expression, context);
  }

  const [left, right] = node.operands.map((operand) =>
    compileExpression(operand, context),
  );

  return (OPERATOR_SQL[node.operator] ?? "null")
    .replaceAll("{a}", () => left ?? "null")
    .replaceAll("{b}", () => right ?? "null");
}

/**
 * One column a metric, `m0`, `m1`, in the order given, each computed from the
 * expression of the metric.
 */
export function compileMetricColumns(
  metrics: readonly CatalogMetric[],
  context: Readonly<{ catalog: MetricCatalog; resolve: MeasureResolver }>,
): string {
  let sql = "";

  for (const [index, metric] of metrics.entries()) {
    sql += `,\n    (${compileExpression(metric.expression, context)})::float8 as ${METRIC_COLUMN_PREFIX}${String(index)}`;
  }

  return sql;
}

/**
 * A measure over the rollup rows, or none for a measure the rollups cannot
 * answer because it does not merge across days.
 */
export function compileRolledMeasure(
  measure: CatalogMeasure,
): null | RolledMeasure {
  const template = ROLLED_AGGREGATE_SQL[measure.aggregate];

  if (template === undefined || !isRolledMeasure(measure)) {
    return null;
  }

  const column =
    measure.factsColumn === null ? "" : `w."${measure.factsColumn}"`;
  const sql = template.sql
    .replaceAll("{c}", () => column)
    .replaceAll("{argument}", () => String(measure.argument ?? 0.5));

  return { sql };
}

/**
 * Whether a group's value is the sum of its subgroups': the expression is one
 * measure that sums, or a metric that is.
 */
export function deriveAdditive(
  expression: ExpressionNode,
  catalog: MetricCatalog,
): boolean {
  let node = expression;

  while (node.kind === "metric") {
    const next = catalog.metrics.get(node.slug);

    if (next === undefined) {
      return false;
    }

    node = next.expression;
  }

  return (
    node.kind === "measure" &&
    catalog.measures.get(node.slug)?.aggregate === "sum"
  );
}

/**
 * What the expression reads over no events, as Postgres would work out its operators.
 */
export function deriveEmptyValue(
  node: ExpressionNode,
  catalog: MetricCatalog,
): EmptyValue {
  if (node.kind === "measure") {
    const measure = catalog.measures.get(node.slug);

    return measure === undefined ? null : EMPTY_VALUES[measure.aggregate];
  }

  if (node.kind === "metric") {
    const metric = catalog.metrics.get(node.slug);

    return metric === undefined
      ? null
      : deriveEmptyValue(metric.expression, catalog);
  }

  const [left = null, right = null] = node.operands.map((operand) =>
    deriveEmptyValue(operand, catalog),
  );

  return EMPTY_OPERATORS[node.operator](left, right);
}

/**
 * Whether the rollups answer the measure: the day grain carries it, nothing
 * narrows its rows, and its aggregate is one they compute.
 */
export function isRolledMeasure(measure: CatalogMeasure): boolean {
  return (
    ROLLED_AGGREGATE_SQL[measure.aggregate] !== undefined &&
    measure.conditionColumn === null &&
    measure.grains.includes("day")
  );
}

/**
 * Whether the measure counts distinct values, and so is counted apart in the
 * facts, a statement a level, joined to the rest.
 */
export function isSideMeasure(measure: CatalogMeasure): boolean {
  return measure.aggregate === "distinct-tags";
}

/**
 * The columns of the facts the measures read from an event row, beyond the
 * `carried` ones every event row has, sorted.
 */
export function listEventColumns(
  measures: readonly CatalogMeasure[],
  carried: ReadonlySet<string> = EVENT_BASE_COLUMNS,
): string[] {
  const columns = new Set<string>();

  for (const measure of measures) {
    for (const column of [
      EVENT_COLUMN_KINDS.has(measure.aggregate) ? measure.factsColumn : null,
      measure.conditionColumn,
    ]) {
      if (column !== null && !carried.has(column)) {
        columns.add(column);
      }
    }
  }

  return [...columns].toSorted();
}

// 🔏 Private Functions

/**
 * An instant's aggregate in epoch milliseconds; any other as it is.
 */
function toUnit(measure: CatalogMeasure, sql: string): string {
  return measure.unit === "instant" ? `extract(epoch from ${sql}) * 1000` : sql;
}
