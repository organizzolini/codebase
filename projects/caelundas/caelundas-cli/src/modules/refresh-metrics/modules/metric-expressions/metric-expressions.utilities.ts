// 🌎 Utilities

import {
  METRIC_EXPRESSIONS_CLASS_DEFINITIONS,
  METRIC_EXPRESSIONS_END_ANCHOR,
  METRIC_EXPRESSIONS_OPERATOR_SYMBOLS,
  METRIC_EXPRESSIONS_ORDERED_OPERATORS,
  METRIC_EXPRESSIONS_SHAPES,
  METRIC_EXPRESSIONS_START_ANCHOR,
  MetricExpressionsAnchorError,
  metricExpressionsMissingMessage,
} from "./metric-expressions.constants";

import type {
  MetricExpressionEntry,
  MetricExpressionNode,
  MetricExpressionParent,
  MetricExpressionTree,
} from "./metric-expressions.types";
import type { Metric, MetricExpression } from "@codebase/caelundas-db";

/**
 * Builds each metric's expression tree, by slug, with operands in position
 * order.
 * @throws Error when a metric's root is not among the expressions.
 */
export function buildMetricExpressionTrees(
  metrics: readonly Metric[],
  expressions: readonly MetricExpression[],
): MetricExpressionTree[] {
  const byId = new Map(
    expressions.map((expression) => [expression.id, expression]),
  );
  const operands = new Map<string, MetricExpression[]>();
  for (const expression of expressions) {
    if (expression.parentId === null || expression.parentId === undefined) {
      continue;
    }
    operands.set(expression.parentId, [
      ...(operands.get(expression.parentId) ?? []),
      expression,
    ]);
  }

  return metrics
    .toSorted((left, right) => left.slug.localeCompare(right.slug))
    .flatMap(({ expressionId, name, slug, unit }) => {
      if (expressionId === null || expressionId === undefined) {
        return [];
      }
      const root = byId.get(expressionId);
      if (root === undefined) {
        throw new Error(metricExpressionsMissingMessage(slug, expressionId));
      }
      return [{ expression: nodeOf(root, operands), name, slug, unit }];
    });
}

/** The expression in infix form, an operand that is itself an operator in parentheses. */
export function infixOf(node: MetricExpressionNode, isRoot = true): string {
  if (node.kind === "measure" || node.kind === "metric") {
    return node.kind === "metric" ? `metric:${node.slug}` : node.slug;
  }
  const symbol =
    METRIC_EXPRESSIONS_OPERATOR_SYMBOLS[node.operator] ?? node.operator;
  const infix = node.children
    .map((child) => infixOf(child, false))
    .join(` ${symbol} `);

  return isRoot ? infix : `(${infix})`;
}

/**
 * The generated block of the Markdown file: a table of the metrics and their
 * infix expressions, then one Mermaid flowchart per metric.
 */
export function renderMetricExpressionsBlock(
  trees: readonly MetricExpressionTree[],
): string {
  return [
    METRIC_EXPRESSIONS_START_ANCHOR,
    "",
    "## Metrics",
    "",
    ...renderTable([
      ["Metric", "Slug", "Unit", "Expression"],
      ...trees.map(({ expression, name, slug, unit }) => [
        name,
        `\`${slug}\``,
        unit,
        `\`${infixOf(expression)}\``,
      ]),
    ]),
    "",
    "## Diagrams",
    "",
    ...trees.flatMap((tree) => [
      `### ${tree.name}`,
      "",
      "```mermaid",
      ...renderFlowchart(tree),
      "```",
      "",
    ]),
    METRIC_EXPRESSIONS_END_ANCHOR,
  ].join("\n");
}

/**
 * Splices the block into `content` between its anchors, or after its prose.
 * @throws MetricExpressionsAnchorError when the anchors are not one ordered pair.
 */
export function spliceMetricExpressionsMarkdown(
  content: string | undefined,
  trees: readonly MetricExpressionTree[],
): string {
  const block = renderMetricExpressionsBlock(trees);
  if (content === undefined || content.trim() === "") return `${block}\n`;

  const lines = content.split("\n");
  const start = lines.indexOf(METRIC_EXPRESSIONS_START_ANCHOR);
  const end = lines.indexOf(METRIC_EXPRESSIONS_END_ANCHOR);
  if (start === -1 && end === -1) {
    return `${content.trimEnd()}\n\n${block}\n`;
  }
  if (start === -1 || end < start) {
    throw new MetricExpressionsAnchorError(
      `Markdown must contain one ordered pair of ${METRIC_EXPRESSIONS_START_ANCHOR} and ${METRIC_EXPRESSIONS_END_ANCHOR} markers.`,
    );
  }

  return [...lines.slice(0, start), block, ...lines.slice(end + 1)].join("\n");
}

/** A node's id and quoted label, in its class's shape. */
function declarationOf({
  className,
  id,
  label,
}: MetricExpressionEntry): string {
  const [open, close] = METRIC_EXPRESSIONS_SHAPES[className];

  return `${id}${open}"${label}"${close}`;
}

/** An edge, labelled only when it carries an operand position. */
function edgeOf(from: string, to: string, position?: number): string {
  return position === undefined
    ? `${from} --> ${to}`
    : `${from} -->|"${String(position)}"| ${to}`;
}

/** Adds the node, then its operands, numbering them when their order matters. */
function entriesOf(
  node: MetricExpressionNode,
  parent: MetricExpressionParent,
  entries: MetricExpressionEntry[],
): void {
  const id = `n${String(entries.length)}`;
  entries.push({
    className: node.kind,
    edge: edgeOf(parent.id, id, parent.position),
    id,
    label: labelOf(node),
  });
  if (node.kind !== "operator") return;
  const isOrdered = METRIC_EXPRESSIONS_ORDERED_OPERATORS.has(node.operator);
  node.children.forEach((child, index) => {
    entriesOf(
      child,
      { id, position: isOrdered ? index + 1 : undefined },
      entries,
    );
  });
}

/** A node's text, with no HTML: `"` becomes `'` and angle brackets go. */
function labelOf(node: MetricExpressionNode): string {
  if (node.kind === "operator") {
    const symbol = METRIC_EXPRESSIONS_OPERATOR_SYMBOLS[node.operator];

    return plainText(
      symbol === undefined ? node.operator : `${symbol} ${node.operator}`,
    );
  }

  return plainText(`${node.name} (${node.slug})`);
}

/** A measure expression's node, named for the measure it reads. */
function measureNodeOf(expression: MetricExpression): MetricExpressionNode {
  const { measure } = expression;

  return {
    kind: "measure",
    name: measure?.name ?? "",
    slug: measure?.slug ?? "",
  };
}

/** A metric expression's node, which names the metric it reads. */
function metricNodeOf(expression: MetricExpression): MetricExpressionNode {
  const slug = expression.metric?.slug ?? "";

  return { kind: "metric", name: expression.metric?.name ?? slug, slug };
}

/** One node of the expression, with its operands under it in position order. */
function nodeOf(
  expression: MetricExpression,
  operands: ReadonlyMap<string, readonly MetricExpression[]>,
): MetricExpressionNode {
  switch (expression.kind) {
    case "measure": {
      return measureNodeOf(expression);
    }
    case "metric": {
      return metricNodeOf(expression);
    }
    default: {
      return {
        children: (operands.get(expression.id) ?? [])
          .toSorted((left, right) => left.position - right.position)
          .map((child) => nodeOf(child, operands)),
        kind: "operator",
        operator: expression.operator ?? "",
      };
    }
  }
}

/** The text with `"` as `'` and angle brackets removed. */
function plainText(text: string): string {
  return text.replaceAll('"', "'").replaceAll(/[<>]/gu, "");
}

/**
 * The metric as a flowchart: over its expression, or only its measure when
 * that is all it reads.
 */
function renderFlowchart({
  expression,
  name,
  slug,
}: MetricExpressionTree): string[] {
  const entries: MetricExpressionEntry[] = [];
  if (expression.kind === "measure") {
    const isRepeat = expression.name.toLowerCase() === name.toLowerCase();
    entries.push({
      className: "measure",
      id: "n0",
      label: labelOf(
        isRepeat ? { ...expression, name: "measure" } : expression,
      ),
    });
  } else {
    entries.push({
      className: "root",
      id: "n0",
      label: labelOf({ kind: "metric", name, slug }),
    });
    entriesOf(expression, { id: "n0" }, entries);
  }

  return [
    "flowchart TB",
    ...METRIC_EXPRESSIONS_CLASS_DEFINITIONS.map((line) => `    ${line}`),
    ...entries.map((entry) => `    ${declarationOf(entry)}`),
    ...entries.flatMap(({ edge }) =>
      edge === undefined ? [] : [`    ${edge}`],
    ),
    ...entries.map(({ className, id }) => `    class ${id} ${className}`),
  ];
}
/** A Markdown table with its columns padded to the widest cell. */
function renderTable(rows: readonly (readonly string[])[]): string[] {
  const [header = [], ...body] = rows;
  const widths = header.map((_, column) =>
    Math.max(...rows.map((row) => (row[column] ?? "").length)),
  );
  const line = (cells: readonly string[]): string =>
    `| ${cells.map((cell, column) => cell.padEnd(widths[column] ?? 0)).join(" | ")} |`;

  return [
    line(header),
    `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`,
    ...body.map((row) => line(row)),
  ];
}
