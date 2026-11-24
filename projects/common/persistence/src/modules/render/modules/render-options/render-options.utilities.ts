// 🌎 Utilities

import {
  maskPostgresCredentials,
  parsePostgresUri,
} from "../../../postgresql-utilities/postgresql-utilities.utilities";

import {
  RENDER_DIAGRAM_SCHEMA,
  RENDER_FILTER_PATTERN,
  RENDER_FILTER_SCHEMA,
  RENDER_OPTION_MESSAGES,
  RENDER_SORT_PATTERN,
  RENDER_SORT_SCHEMA,
  RENDER_TREE_FIELDS,
  renderOptionsDiagramMessage,
  RenderOptionsError,
  renderOptionsFilterSyntaxMessage,
  renderOptionsPositiveIntegerMessage,
  renderOptionsSortSyntaxMessage,
} from "./render-options.constants";

import type { GraphDiagram } from "../render-mermaid/render-mermaid.types";
import type {
  GraphFilter,
  GraphOptions,
  GraphPaging,
  GraphPlan,
  GraphSort,
  GraphTreeFields,
} from "./render-options.types";

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
 * The diagram `--diagram` names, `flowchart` when it is absent.
 * @throws RenderOptionsError listing the choices when it names another.
 */
export function parseGraphDiagram(value: string | undefined): GraphDiagram {
  const parsed = RENDER_DIAGRAM_SCHEMA.safeParse(value);
  if (!parsed.success) {
    throw new RenderOptionsError(renderOptionsDiagramMessage(String(value)));
  }
  return parsed.data;
}

/**
 * How the graph is drawn: the diagram, the two caps and the tree fields, validated together.
 * @throws RenderOptionsError on a bad diagram or cap.
 */
export function parseGraphDrawing({
  diagram,
  iconField,
  noteField,
  orderField,
  truncateBreadth,
  truncateDepth,
}: Pick<
  GraphOptions,
  | "diagram"
  | "iconField"
  | "noteField"
  | "orderField"
  | "truncateBreadth"
  | "truncateDepth"
>): Pick<
  GraphPlan,
  "diagram" | "fields" | "truncateBreadth" | "truncateDepth"
> {
  return {
    diagram: parseGraphDiagram(diagram),
    fields: parseGraphFields({ iconField, noteField, orderField }),
    truncateBreadth: positiveIntegerFlag("--truncate-breadth", truncateBreadth),
    truncateDepth: positiveIntegerFlag("--truncate-depth", truncateDepth),
  };
}

/**
 * The entity properties a tree's icons, notes and sibling order are read from, each its default when its flag is absent or blank.
 */
export function parseGraphFields({
  iconField,
  noteField,
  orderField,
}: Pick<
  GraphOptions,
  "iconField" | "noteField" | "orderField"
>): GraphTreeFields {
  return {
    icon: namedField(iconField, RENDER_TREE_FIELDS.icon),
    note: namedField(noteField, RENDER_TREE_FIELDS.note),
    order: namedField(orderField, RENDER_TREE_FIELDS.order),
  };
}

/**
 * `expression` as a row filter: its column, operator, and value.
 * @throws RenderOptionsError naming the grammar when it is not `column<op>value`.
 */
export function parseGraphFilter(expression: string): GraphFilter {
  const match = RENDER_FILTER_PATTERN.exec(expression);
  const parsed = RENDER_FILTER_SCHEMA.safeParse({
    column: match?.[1],
    operator: match?.[2],
    value: match?.[3],
  });
  if (!parsed.success) {
    throw new RenderOptionsError(renderOptionsFilterSyntaxMessage(expression));
  }
  return { ...parsed.data, expression };
}

/**
 * The page `--page` and `--limit` name, or `undefined` without `--limit`.
 * @throws RenderOptionsError on a bad flag.
 */
export function parseGraphPaging(
  page: readonly string[] | undefined,
  limit: string | undefined,
): GraphPaging | undefined {
  const pages = [
    ...new Set(
      (page ?? []).map((value) => positiveIntegerFlag("--page", value) ?? 1),
    ),
  ];
  const rootLimit = positiveIntegerFlag("--limit", limit);
  if (pages.length > 0 && rootLimit === undefined) {
    throw new RenderOptionsError(RENDER_OPTION_MESSAGES.pageNeedsLimit);
  }
  if (rootLimit === undefined) return undefined;
  return {
    all: pages.length === 0,
    limit: rootLimit,
    page: pages[0] ?? 1,
    pages,
  };
}

/**
 * The filters and sort keys `--filter` and `--sort` name, in order.
 * @throws RenderOptionsError on a bad expression.
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
 * @throws RenderOptionsError naming the grammar when it is not `column[:asc|desc]`.
 */
export function parseGraphSort(expression: string): GraphSort {
  const match = RENDER_SORT_PATTERN.exec(expression);
  const parsed = RENDER_SORT_SCHEMA.safeParse({
    column: match?.[1],
    direction: match?.[2],
  });
  if (!parsed.success) {
    throw new RenderOptionsError(renderOptionsSortSyntaxMessage(expression));
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
 * The number a cap flag's text names, or `undefined` when absent.
 * @throws RenderOptionsError when the text is not a positive integer.
 */
export function positiveIntegerFlag(
  flag: string,
  value: string | undefined,
): number | undefined {
  if (value === undefined) return undefined;
  if (!/^[1-9]\d*$/u.test(value)) {
    throw new RenderOptionsError(
      renderOptionsPositiveIntegerMessage(flag, value),
    );
  }
  return Number(value);
}

/**
 * The three options every graph command needs, now known to be given.
 * @throws RenderOptionsError naming the first one missing, with its usage.
 */
export function requireGraphOptions({
  entities,
  schema,
  sourceUri,
}: Pick<GraphOptions, "entities" | "schema" | "sourceUri">): {
  readonly entities: string[];
  readonly schema: string;
  readonly sourceUri: string;
} {
  if (sourceUri === undefined) {
    throw new RenderOptionsError(RENDER_OPTION_MESSAGES.sourceUri);
  }
  if (entities === undefined) {
    throw new RenderOptionsError(RENDER_OPTION_MESSAGES.entities);
  }
  if (schema === undefined) {
    throw new RenderOptionsError(RENDER_OPTION_MESSAGES.schema);
  }
  return { entities, schema, sourceUri };
}

/**
 * A field name, trimmed, or its default when it is absent or blank.
 */
function namedField(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? fallback : trimmed;
}
