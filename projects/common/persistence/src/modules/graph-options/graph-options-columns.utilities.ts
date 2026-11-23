// 🌎 Utilities

import {
  GRAPH_DATE_TYPE,
  GRAPH_NUMBER_TYPE,
  GRAPH_NUMBER_VALUE,
  graphComparisonKindMessage,
  graphDateValueMessage,
  graphNumberValueMessage,
  GraphOptionsError,
  graphUnknownColumnMessage,
} from "./graph-options.constants";

import type {
  GraphColumn,
  GraphColumnKind,
  GraphFilter,
  GraphFilterOperator,
  GraphOrder,
  GraphPredicate,
  GraphSort,
  GraphView,
} from "./graph-options.types";

/**
 * Passes when every column a `--filter` or `--sort` names is one of `names`,
 * before any connection opens.
 * @throws GraphOptionsError naming the unknown column and the columns there are.
 */
export function assertGraphColumnNames(
  names: readonly string[],
  filters: readonly GraphFilter[],
  sorts: readonly GraphSort[],
): void {
  for (const filter of filters) assertNamed(names, "--filter", filter);
  for (const sort of sorts) assertNamed(names, "--sort", sort);
}

/**
 * The WHERE clause that keeps the rows every predicate matches, with each
 * value bound as a parameter. `=`, `!=`, and `~=` compare the column's text,
 * so a NULL matches only `!=`; `~=` binds the value wrapped in wildcards, with
 * its own wildcards escaped.
 */
export function filterClause(predicates: readonly GraphPredicate[]): {
  readonly parameters: string[];
  readonly sql: string;
} {
  const parameters: string[] = [];
  const clauses: string[] = [];
  for (const { column, operator, value } of predicates) {
    const bound =
      operator === "~="
        ? `%${value.replaceAll(/[\\%_]/gu, String.raw`\$&`)}%`
        : value;
    parameters.push(bound);
    const placeholder = `$${String(parameters.length)}`;
    clauses.push(`(${comparisonSql(column.sqlName, operator, placeholder)})`);
  }
  return { parameters, sql: clauses.join(" AND ") };
}

/** The kind of a column, from its SQL type as the driver normalizes it. */
export function graphColumnKind(sqlType: string): GraphColumnKind {
  const type = sqlType.toLowerCase();
  if (GRAPH_NUMBER_TYPE.test(type)) return "number";
  if (GRAPH_DATE_TYPE.test(type)) return "date";
  return "text";
}

/**
 * The filters and sort keys resolved to their columns, with each `<` or `>`
 * checked against its column's kind.
 * @throws GraphOptionsError naming the unknown column, the text-column comparison, or the value that is not a number or date.
 */
export function resolveGraphView(
  columns: readonly GraphColumn[],
  filters: readonly GraphFilter[],
  sorts: readonly GraphSort[],
): GraphView {
  const predicates: GraphPredicate[] = [];
  for (const filter of filters) {
    predicates.push(resolvePredicate(columns, filter));
  }
  const orders: GraphOrder[] = [];
  for (const sort of sorts) orders.push(resolveOrder(columns, sort));
  return { filters: predicates, sorts: orders };
}

/**
 * The ORDER BY terms that sort by each key in order, with NULLs last in
 * either direction.
 */
export function sortClause(orders: readonly GraphOrder[]): string {
  const terms: string[] = [];
  for (const { column, direction } of orders) {
    const order = direction === "desc" ? "DESC" : "ASC";
    terms.push(`${column.sqlName} ${order} NULLS LAST`);
  }
  return terms.join(", ");
}

/**
 * Passes when a `<` or `>` filter compares a numeric or date column, with a
 * value of that kind.
 * @throws GraphOptionsError when the column is text, or the value is not a number or date.
 */
function assertComparable(column: GraphColumn, filter: GraphFilter): void {
  if (column.kind === "text") {
    throw new GraphOptionsError(
      graphComparisonKindMessage(filter.expression, column.name),
    );
  }
  if (column.kind === "number" && !GRAPH_NUMBER_VALUE.test(filter.value)) {
    throw new GraphOptionsError(
      graphNumberValueMessage(filter.expression, filter.value),
    );
  }
  if (column.kind === "date" && Number.isNaN(Date.parse(filter.value))) {
    throw new GraphOptionsError(
      graphDateValueMessage(filter.expression, filter.value),
    );
  }
}

/**
 * Passes when the column `expression` names is one of `names`.
 * @throws GraphOptionsError naming the unknown column and the columns there are.
 */
function assertNamed(
  names: readonly string[],
  flag: "--filter" | "--sort",
  expression: Pick<GraphFilter, "column" | "expression">,
): void {
  if (!names.includes(expression.column)) {
    throw new GraphOptionsError(
      graphUnknownColumnMessage({
        column: expression.column,
        columns: names,
        expression: expression.expression,
        flag,
      }),
    );
  }
}

/** The SQL comparing `column` with `placeholder`, the bound value, under `operator`. */
function comparisonSql(
  column: string,
  operator: GraphFilterOperator,
  placeholder: string,
): string {
  if (operator === "=") return `CAST(${column} AS text) = ${placeholder}`;
  if (operator === "!=") {
    return `CAST(${column} AS text) IS DISTINCT FROM ${placeholder}`;
  }
  if (operator === "~=") return `CAST(${column} AS text) LIKE ${placeholder}`;
  if (operator === "<") return `${column} < ${placeholder}`;
  return `${column} > ${placeholder}`;
}

/**
 * The column `expression` names among `columns`.
 * @throws GraphOptionsError naming the unknown column and the columns there are.
 */
function resolveColumn(
  columns: readonly GraphColumn[],
  flag: "--filter" | "--sort",
  expression: Pick<GraphFilter, "column" | "expression">,
): GraphColumn {
  const names: string[] = [];
  for (const column of columns) {
    if (column.name === expression.column) return column;
    names.push(column.name);
  }
  throw new GraphOptionsError(
    graphUnknownColumnMessage({
      column: expression.column,
      columns: names,
      expression: expression.expression,
      flag,
    }),
  );
}

/** The sort key a `--sort` becomes once its column is known. */
function resolveOrder(
  columns: readonly GraphColumn[],
  sort: GraphSort,
): GraphOrder {
  return {
    column: resolveColumn(columns, "--sort", sort),
    direction: sort.direction,
  };
}

/** The predicate a filter becomes once its column is known and its value fits the column. */
function resolvePredicate(
  columns: readonly GraphColumn[],
  filter: GraphFilter,
): GraphPredicate {
  const column = resolveColumn(columns, "--filter", filter);
  if (filter.operator === "<" || filter.operator === ">") {
    assertComparable(column, filter);
  }
  return { column, operator: filter.operator, value: filter.value };
}
