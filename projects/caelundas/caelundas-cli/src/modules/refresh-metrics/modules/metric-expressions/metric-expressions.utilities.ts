// 🌎 Utilities

import {
  METRIC_EXPRESSIONS_CLASS_DEFINITIONS,
  METRIC_EXPRESSIONS_COLUMNS,
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
 * infix expressions, each linking to its section, then one `##` section per
 * unit holding a small flowchart of that unit's metrics in rows.
 */
export function renderMetricExpressionsBlock(
  trees: readonly MetricExpressionTree[],
): string {
  const units = [...new Set(trees.map(({ unit }) => unit))].toSorted();
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
        `[${unit}](#${unitSlug(unit)})`,
        `\`${infixOf(expression)}\``,
      ]),
    ]),
    ...units.flatMap((unit) => [
      "",
      `## Unit ${unit}`,
      "",
      "```mermaid",
      ...renderFlowchart(trees.filter((tree) => tree.unit === unit)),
      "```",
    ]),
    "",
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

/** A node's declaration: its id and quoted label, in its class's shape. */
function declarationOf({
  className,
  id,
  label,
}: MetricExpressionEntry): string {
  const [open, close] = METRIC_EXPRESSIONS_SHAPES[className];

  return `${id}${open}"${label}"${close}`;
}

/** Adds the node, then its operands, numbering them when their order matters. */
function entriesOf(
  node: MetricExpressionNode,
  parent: MetricExpressionParent,
  entries: MetricExpressionEntry[],
): void {
  const id = `${parent.prefix}n${String(entries.length)}`;
  entries.push({
    className: node.kind,
    id,
    label: labelOf(node),
    parent: parent.id,
    position: parent.position,
  });
  if (node.kind !== "operator") return;
  const isOrdered = METRIC_EXPRESSIONS_ORDERED_OPERATORS.has(node.operator);
  node.children.forEach((child, index) => {
    entriesOf(
      child,
      {
        id,
        position: isOrdered ? index + 1 : undefined,
        prefix: parent.prefix,
      },
      entries,
    );
  });
}

/** A metric's nodes: its root, then its expression, or only its measure when that is all it reads. */
function entriesOfMetric(
  { expression, name, slug }: MetricExpressionTree,
  prefix: string,
): MetricExpressionEntry[] {
  const entries: MetricExpressionEntry[] = [];
  if (expression.kind === "measure") {
    const isRepeat = expression.name.toLowerCase() === name.toLowerCase();
    entries.push({
      className: "measure",
      id: `${prefix}n0`,
      label: labelOf(
        isRepeat ? { ...expression, name: "measure" } : expression,
      ),
    });
  } else {
    entries.push({
      className: "root",
      id: `${prefix}n0`,
      label: labelOf({ kind: "metric", name, slug }),
    });
    entriesOf(expression, { id: `${prefix}n0`, prefix }, entries);
  }
  return entries;
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

/** One line per operator naming its operands: each node declared where it first appears, operands with one position chained with `&`. */
function nodeLines(entries: readonly MetricExpressionEntry[]): string[] {
  const declared = new Set<string>();
  const reference = (entry: MetricExpressionEntry): string => {
    if (declared.has(entry.id)) return entry.id;
    declared.add(entry.id);
    return declarationOf(entry);
  };
  const lines: string[] = [];
  for (const parent of entries) {
    const children = entries.filter((entry) => entry.parent === parent.id);
    if (children.length === 0) continue;
    const from = reference(parent);
    const positions = [...new Set(children.map(({ position }) => position))];
    for (const [index, position] of positions.entries()) {
      const label = position === undefined ? "" : `|"${String(position)}"|`;
      const targets = children
        .filter((child) => child.position === position)
        .map((child) => reference(child))
        .join(" & ");
      lines.push(`${index === 0 ? from : parent.id} -->${label} ${targets}`);
    }
  }
  const [first] = entries;
  if (lines.length === 0 && first !== undefined) lines.push(reference(first));
  return lines;
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
 * The metrics as one flowchart: a subgraph each, top to bottom inside, laid out
 * in rows. Every node is declared once where it first appears, operands of a
 * parent chained after it, and each class named on one line.
 */
function renderFlowchart(trees: readonly MetricExpressionTree[]): string[] {
  const body: string[] = [];
  const classes = new Map<string, string[]>();
  const subgraphs: string[] = [];
  for (const [index, tree] of trees.entries()) {
    const entries = entriesOfMetric(tree, `m${String(index)}`);
    for (const { className, id } of entries) {
      classes.set(className, [...(classes.get(className) ?? []), id]);
    }
    const id = `m${String(index)}`;
    subgraphs.push(id);
    body.push(
      `    subgraph ${id}["${plainText(tree.name)}"]`,
      "        direction TB",
      ...nodeLines(entries).map((line) => `        ${line}`),
      "    end",
    );
  }
  for (let row = 0; row < subgraphs.length; row += METRIC_EXPRESSIONS_COLUMNS) {
    const cells = subgraphs.slice(row, row + METRIC_EXPRESSIONS_COLUMNS);
    if (cells.length > 1) body.push(`    ${cells.join(" ~~~ ")}`);
  }

  return [
    "flowchart LR",
    ...METRIC_EXPRESSIONS_CLASS_DEFINITIONS.map((line) => `    ${line}`),
    ...body,
    ...[...classes].map(
      ([className, ids]) => `    class ${ids.join(",")} ${className}`,
    ),
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

/** The anchor GitHub gives the heading `## Unit <unit>`. */
function unitSlug(unit: string): string {
  return `unit-${unit.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
}
