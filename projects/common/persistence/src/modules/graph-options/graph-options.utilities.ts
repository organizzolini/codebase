// 🌎 Utilities

import {
  maskPostgresCredentials,
  parsePostgresUri,
} from "../postgresql-utilities/postgresql-utilities.utilities";

import {
  GRAPH_FILTER_PATTERN,
  GRAPH_FILTER_SCHEMA,
  GRAPH_OPTION_MESSAGES,
  GRAPH_SORT_PATTERN,
  GRAPH_SORT_SCHEMA,
  graphFilterSyntaxMessage,
  GraphOptionsError,
  graphPositiveIntegerMessage,
  graphSortSyntaxMessage,
} from "./graph-options.constants";

import type {
  GraphFilter,
  GraphPaging,
  GraphPlan,
  GraphSort,
} from "./graph-options.types";

/**
 * `error` again, with its message's password masked, so a connection failure
 * never shows the password it was made with.
 */
export function maskedError(error: unknown, password: string): Error {
  const message = error instanceof Error ? error.message : String(error);
  const masked = new Error(maskPostgresCredentials(message, password));
  masked.name = error instanceof Error ? error.name : Error.name;
  return masked;
}

/**
 * `expression` as a row filter: its column, operator, and value.
 * @throws GraphOptionsError naming the grammar when it is not `column<op>value`.
 */
export function parseGraphFilter(expression: string): GraphFilter {
  const match = GRAPH_FILTER_PATTERN.exec(expression);
  const parsed = GRAPH_FILTER_SCHEMA.safeParse({
    column: match?.[1],
    operator: match?.[2],
    value: match?.[3],
  });
  if (!parsed.success) {
    throw new GraphOptionsError(graphFilterSyntaxMessage(expression));
  }
  return { ...parsed.data, expression };
}

/**
 * The page `--page` and `--limit` name, or `undefined` without `--limit`.
 * @throws GraphOptionsError on a bad flag.
 */
export function parseGraphPaging(
  page: string | undefined,
  limit: string | undefined,
): GraphPaging | undefined {
  const pageNumber = positiveIntegerFlag("--page", page);
  const rootLimit = positiveIntegerFlag("--limit", limit);
  if (pageNumber !== undefined && rootLimit === undefined) {
    throw new GraphOptionsError(GRAPH_OPTION_MESSAGES.pageNeedsLimit);
  }
  if (rootLimit === undefined) return undefined;
  return { limit: rootLimit, page: pageNumber ?? 1 };
}

/**
 * The filters and sort keys `--filter` and `--sort` name, in order.
 * @throws GraphOptionsError on a bad expression.
 */
export function parseGraphRows(
  filter: readonly string[] = [],
  sort: readonly string[] = [],
): { readonly filters: GraphFilter[]; readonly sorts: GraphSort[] } {
  return {
    filters: filter.map((expression) => parseGraphFilter(expression)),
    sorts: sort.map((expression) => parseGraphSort(expression)),
  };
}

/**
 * `expression` as a sort key: its column and direction, ascending by default.
 * @throws GraphOptionsError naming the grammar when it is not `column[:asc|desc]`.
 */
export function parseGraphSort(expression: string): GraphSort {
  const match = GRAPH_SORT_PATTERN.exec(expression);
  const parsed = GRAPH_SORT_SCHEMA.safeParse({
    column: match?.[1],
    direction: match?.[2],
  });
  if (!parsed.success) {
    throw new GraphOptionsError(graphSortSyntaxMessage(expression));
  }
  return { ...parsed.data, expression };
}

/**
 * The connection `--source-uri` names, in `schema`, and that URI with its
 * password masked for log lines.
 * @throws Error when the URI cannot be parsed.
 */
export function parseGraphSource(
  sourceUri: string,
  schema: string,
): Pick<GraphPlan, "connection" | "source"> {
  const connection = parsePostgresUri(sourceUri, "--source-uri");
  return {
    connection: { ...connection, schema },
    source: maskPostgresCredentials(sourceUri, connection.password),
  };
}

/**
 * The number a cap flag's text names, or `undefined` when the flag is absent.
 * @throws GraphOptionsError naming `flag` and the text when it is not a positive integer.
 */
export function positiveIntegerFlag(
  flag: string,
  value: string | undefined,
): number | undefined {
  if (value === undefined) return undefined;
  if (!/^[1-9]\d*$/u.test(value)) {
    throw new GraphOptionsError(graphPositiveIntegerMessage(flag, value));
  }
  return Number(value);
}
