// ♟️ Constants

/** The line that closes the generated block of the Markdown file. */
export const METRIC_EXPRESSIONS_END_ANCHOR = "<!-- metric-expressions:end -->";

/** The line that opens the generated block of the Markdown file. */
export const METRIC_EXPRESSIONS_START_ANCHOR =
  "<!-- metric-expressions:start -->";

/** The symbol each operator is written with in an infix expression. */
export const METRIC_EXPRESSIONS_OPERATOR_SYMBOLS: Readonly<
  Record<string, string>
> = {
  add: "+",
  divide: "÷",
  multiply: "×",
  percent: "% of",
  subtract: "−",
};

/** Mermaid classes coloring each node kind, readable on light and dark. */
export const METRIC_EXPRESSIONS_CLASS_DEFINITIONS = [
  "classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111",
  "classDef measure fill:#9fd7ae,stroke:#188038,color:#111",
  "classDef metric fill:#fbd774,stroke:#b06000,color:#111",
  "classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111",
] as const;

/** How many metric subgraphs sit side by side in a row. */
export const METRIC_EXPRESSIONS_COLUMNS = 3;

/** The operators whose operand order changes the result. */
export const METRIC_EXPRESSIONS_ORDERED_OPERATORS: ReadonlySet<string> =
  new Set(["divide", "percent", "subtract"]);

/** The brackets that give each node class its Mermaid shape. */
export const METRIC_EXPRESSIONS_SHAPES = {
  measure: ["[", "]"],
  metric: ["([", "])"],
  operator: ["{{", "}}"],
  root: ["([", "])"],
} as const;

/** A Markdown file whose anchors are not one ordered pair. */
export class MetricExpressionsAnchorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = MetricExpressionsAnchorError.name;
  }
}

/** The check found the Markdown out of step with the database. */
export class MetricExpressionsCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = MetricExpressionsCheckError.name;
  }
}

/** `--output-markdown` was not given. */
export class MetricExpressionsOptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = MetricExpressionsOptionError.name;
  }
}

/** The metric whose expression root is not in the table. */
export const metricExpressionsMissingMessage = (
  slug: string,
  id: string,
): string => `Metric ${slug} names expression ${id}, which is not in the table`;
