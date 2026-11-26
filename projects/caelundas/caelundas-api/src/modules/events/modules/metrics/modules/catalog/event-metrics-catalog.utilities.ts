import { BadRequestException } from "@nestjs/common";

import {
  DERIVED_EVENT_COLUMNS,
  MEASURE_REGISTRY,
  METRIC_ORDER,
} from "../measures/event-metrics-measures.constants";
import {
  deriveAdditive,
  deriveEmptyValue,
} from "../measures/event-metrics-measures.utilities";

import { EventMetricUnit } from "./event-metric-unit.entities";
import {
  EXPRESSION_OPERATORS,
  METRIC_ALIASES,
  SLUG_PATTERN,
} from "./event-metrics-catalog.constants";

import type { EventMeasureEntity } from "./event-measure.entities";
import type { EventMetricEntity } from "./event-metric.entities";
import type { EventMetricCatalogEntity } from "./event-metrics-catalog.entities";
import type {
  CatalogMeasure,
  CatalogMetric,
  ExpressionContext,
  ExpressionNode,
  ExpressionOperator,
  ExpressionRow,
  MeasureRow,
  MetricCatalog,
  MetricCatalogRows,
} from "./event-metrics-catalog.types";
import type { MetricExpression } from "@codebase/caelundas-db";

// 🌎 Public Functions

// Throws on anything that could make wrong or unsafe SQL: a measure with no
// registry entry or another unit, a registry column the view lacks, a
// malformed tree, or a metric that reads itself.
/**
 * Builds the catalog from the table rows and the code registry.
 */
export function buildCatalog(rows: MetricCatalogRows): MetricCatalog {
  checkRegistry(rows.eventColumns);

  const measures = new Map(
    rows.measures.map((row) => [row.slug, buildMeasure(row)]),
  );
  const metrics = buildMetrics(rows, {
    children: groupChildren(rows.expressions),
    measures: new Map(rows.measures.map((row) => [row.id, row.slug])),
    metrics: new Map(rows.metrics.map((row) => [row.id, row.slug])),
  });
  const catalog: MetricCatalog = { measures, metrics };

  checkReferences(catalog);
  deriveMetrics(catalog);

  return catalog;
}

/**
 * The measures the metrics read, directly or through other metrics, by slug.
 */
export function collectMeasures(
  metrics: readonly CatalogMetric[],
  catalog: MetricCatalog,
): CatalogMeasure[] {
  const slugs = new Set<string>();
  const seen = new Set<string>();
  const pending: ExpressionNode[] = metrics.map((metric) => metric.expression);

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    if (node.kind === "measure") {
      slugs.add(node.slug);
    } else if (node.kind === "operator") {
      pending.push(...node.operands);
    } else if (!seen.has(node.slug)) {
      seen.add(node.slug);

      const metric = catalog.metrics.get(node.slug);

      if (metric !== undefined) {
        pending.push(metric.expression);
      }
    }
  }

  return [...slugs]
    .toSorted()
    .flatMap((slug) => catalog.measures.get(slug) ?? []);
}

/**
 * The catalog as the GraphQL query answers it: every measure by slug, every
 * metric in the picker's order with the measures it reads.
 */
export function describeCatalog(
  catalog: MetricCatalog,
): EventMetricCatalogEntity {
  const metrics: EventMetricEntity[] = [];

  for (const metric of orderMetrics(catalog)) {
    metrics.push({
      additive: metric.additive,
      icon: metric.icon,
      measures: collectMeasures([metric], catalog).map(({ slug }) => slug),
      name: metric.name,
      note: metric.note,
      slug: metric.slug,
      unit: toUnit(metric.unit),
    });
  }

  return {
    measures: [...catalog.measures.values()].map((measure) =>
      toMeasureEntity(measure),
    ),
    metrics,
  };
}

/**
 * The nodes of the expression trees `findTrees` returns, each with its parent's
 * id, in no particular order.
 */
export function flattenExpressionTrees(
  trees: readonly MetricExpression[],
): ExpressionRow[] {
  const rows: ExpressionRow[] = [];
  const pending = [...trees];

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    rows.push({
      id: node.id,
      kind: node.kind,
      measure_id: node.measureId ?? null,
      metric_id: node.metricId ?? null,
      operator: node.operator ?? null,
      parent_id: node.parentId ?? null,
      position: node.position,
    });
    pending.push(...(node.children ?? []));
  }

  return rows;
}

/**
 * The metrics in the picker's order: those `METRIC_ORDER` lists as it does,
 * then any other by slug.
 */
export function orderMetrics(catalog: MetricCatalog): CatalogMetric[] {
  const listed = METRIC_ORDER.flatMap(
    (slug) => catalog.metrics.get(slug) ?? [],
  );
  const others = [...catalog.metrics.values()]
    .filter(({ slug }) => !METRIC_ORDER.includes(slug))
    .toSorted((left, right) => left.slug.localeCompare(right.slug));

  return [...listed, ...others];
}

/**
 * The metrics the slugs name, each once, in order; an unknown slug is a bad request.
 */
export function resolveMetrics(
  catalog: MetricCatalog,
  slugs: readonly string[],
): CatalogMetric[] {
  const metrics: CatalogMetric[] = [];

  for (const slug of new Set(
    slugs.map((name) => METRIC_ALIASES[name] ?? name),
  )) {
    const metric = catalog.metrics.get(slug);

    if (metric === undefined) {
      throw new BadRequestException(
        `Unknown metric "${slug}"; the metrics are ${orderMetrics(catalog)
          .map((known) => known.slug)
          .join(", ")}.`,
      );
    }

    metrics.push(metric);
  }

  return metrics;
}

// 🔏 Private Functions

/**
 * One measure of the catalog: its row and the registry's entry for its slug,
 * which must give the unit the row does.
 */
function buildMeasure(row: MeasureRow): CatalogMeasure {
  checkSlug("measure", row.slug);

  const spec = Object.hasOwn(MEASURE_REGISTRY, row.slug)
    ? MEASURE_REGISTRY[row.slug]
    : undefined;

  if (spec === undefined) {
    throw new Error(`The measure ${row.slug} has no registry entry`);
  }

  if (spec.unit !== row.unit) {
    throw new Error(
      `The measure ${row.slug} is ${row.unit}, but the registry says ${spec.unit}`,
    );
  }

  return {
    aggregate: spec.aggregate,
    argument: spec.argument ?? null,
    conditionColumn: spec.condition ?? null,
    factsColumn: spec.column,
    grains: spec.grains,
    icon: row.icon,
    id: row.id,
    name: row.name,
    note: row.note,
    slug: row.slug,
    unit: row.unit,
  };
}

/**
 * Every metric of the rows, each with the tree its `expression_id` roots,
 * its derived parts not yet set.
 */
function buildMetrics(
  rows: MetricCatalogRows,
  context: ExpressionContext,
): Map<string, CatalogMetric> {
  const nodes = new Map(rows.expressions.map((row) => [row.id, row]));
  const metrics = new Map<string, CatalogMetric>();

  for (const row of rows.metrics) {
    checkSlug("metric", row.slug);

    const root = nodes.get(row.expression_id ?? "");

    if (root === undefined) {
      throw new Error(`The metric ${row.slug} has no expression`);
    }

    metrics.set(row.slug, {
      additive: false,
      expression: buildNode(root, context),
      icon: row.icon,
      id: row.id,
      name: row.name,
      note: row.note,
      slug: row.slug,
      unit: row.unit,
      zeroIfEmpty: false,
    });
  }

  return metrics;
}

/**
 * One node of a tree and everything beneath it.
 */
function buildNode(
  row: ExpressionRow,
  context: ExpressionContext,
): ExpressionNode {
  if (row.kind === "measure") {
    return { kind: "measure", slug: lookup(context.measures, row.measure_id) };
  }

  if (row.kind === "metric") {
    return { kind: "metric", slug: lookup(context.metrics, row.metric_id) };
  }

  if (row.kind === "operator") {
    return buildOperator(row, context);
  }

  throw new Error(`The expression node ${row.id} is not well formed`);
}

/**
 * An operator node and its operands, checked to be as many as it takes.
 */
function buildOperator(
  row: ExpressionRow,
  context: ExpressionContext,
): ExpressionNode {
  if (!isOperator(row.operator)) {
    throw new Error(`The expression node ${row.id} names no known operator`);
  }

  const operands = (context.children.get(row.id) ?? []).map((child) =>
    buildNode(child, context),
  );

  if (operands.length !== EXPRESSION_OPERATORS[row.operator]) {
    throw new Error(
      `The operator ${row.operator} takes ${String(EXPRESSION_OPERATORS[row.operator])} operands, not ${String(operands.length)}`,
    );
  }

  return { kind: "operator", operands, operator: row.operator };
}

/**
 * Throws when a metric reads a metric or a measure the catalog lacks, or reads
 * itself through the metrics it reads.
 */
function checkReferences(catalog: MetricCatalog): void {
  for (const metric of catalog.metrics.values()) {
    visit(metric, catalog, [metric.slug]);
  }
}

/**
 * Throws when a registry entry names a column an event row lacks, so drift fails at load.
 */
function checkRegistry(eventColumns: ReadonlySet<string>): void {
  for (const [slug, spec] of Object.entries(MEASURE_REGISTRY)) {
    for (const column of [spec.column, spec.condition]) {
      if (
        column !== undefined &&
        column !== null &&
        !eventColumns.has(column) &&
        !DERIVED_EVENT_COLUMNS.has(column)
      ) {
        throw new Error(
          `The measure ${slug} names ${column}, which is no column of an event row`,
        );
      }
    }
  }
}

/**
 * Throws for a slug that is not lowercase words joined by hyphens.
 */
function checkSlug(kind: string, slug: string): void {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `The ${kind} slug ${slug} is not lowercase words and hyphens`,
    );
  }
}

/**
 * Sets each metric's derived `additive` and `zeroIfEmpty`; only a catalog with no cycle may.
 */
function deriveMetrics(catalog: MetricCatalog): void {
  for (const metric of catalog.metrics.values()) {
    metric.additive = deriveAdditive(metric.expression, catalog);
    metric.zeroIfEmpty = deriveEmptyValue(metric.expression, catalog) === 0;
  }
}

/**
 * Each node's children in operand order.
 */
function groupChildren(
  expressions: readonly ExpressionRow[],
): ReadonlyMap<string, readonly ExpressionRow[]> {
  const children = new Map<string, ExpressionRow[]>();

  for (const row of expressions) {
    if (row.parent_id !== null) {
      children.set(row.parent_id, [
        ...(children.get(row.parent_id) ?? []),
        row,
      ]);
    }
  }

  for (const siblings of children.values()) {
    siblings.sort((left, right) => left.position - right.position);
  }

  return children;
}

/**
 * Whether the text is one of the operators.
 */
function isOperator(operator: null | string): operator is ExpressionOperator {
  return operator !== null && operator in EXPRESSION_OPERATORS;
}

/**
 * The slug an id stands for, or a throw when no row has the id.
 */
function lookup(slugs: ReadonlyMap<string, string>, id: null | string): string {
  const slug = id === null ? undefined : slugs.get(id);

  if (slug === undefined) {
    throw new Error(`An expression node reads the missing row ${String(id)}`);
  }

  return slug;
}

/**
 * A measure as the GraphQL query answers it.
 */
function toMeasureEntity(measure: CatalogMeasure): EventMeasureEntity {
  return {
    icon: measure.icon,
    name: measure.name,
    note: measure.note,
    slug: measure.slug,
    unit: toUnit(measure.unit),
  };
}

/**
 * The GraphQL unit a unit is called.
 */
function toUnit(unit: CatalogMeasure["unit"]): EventMetricUnit {
  return {
    count: EventMetricUnit.COUNT,
    duration: EventMetricUnit.DURATION,
    instant: EventMetricUnit.INSTANT,
    none: EventMetricUnit.NONE,
  }[unit];
}

/**
 * Walks a metric's tree, following the metrics it reads, and throws on a
 * cycle.
 */
function visit(
  metric: CatalogMetric,
  catalog: MetricCatalog,
  path: readonly string[],
): void {
  const pending: ExpressionNode[] = [metric.expression];

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    if (node.kind === "operator") {
      pending.push(...node.operands);
    } else if (node.kind === "metric") {
      if (path.includes(node.slug)) {
        throw new Error(`The metric ${node.slug} reads itself`);
      }

      const next = catalog.metrics.get(node.slug);

      if (next !== undefined) {
        visit(next, catalog, [...path, node.slug]);
      }
    }
  }
}
