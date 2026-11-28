// 🏷️ Types

/** One node of a diagram, with the parent it hangs from. */
export interface MetricExpressionEntry {
  /** The node's Mermaid class. */
  readonly className: "measure" | "metric" | "operator" | "root";

  /** Its id, unique in the diagram. */
  readonly id: string;

  /** Its plain-text label. */
  readonly label: string;

  /** The id of the parent it hangs from, none for the first node. */
  readonly parent?: string;

  /** The operand position the edge shows, when the parent's order matters. */
  readonly position?: number | undefined;
}

/** One node of a metric's expression, with its operands in position order. */
export type MetricExpressionNode =
  | {
      /** The operands, in position order. */
      readonly children: readonly MetricExpressionNode[];

      /** What kind of node it is. */
      readonly kind: "operator";

      /** The operator's name, such as `divide`. */
      readonly operator: string;
    }
  | {
      /** What kind of node it is. */
      readonly kind: "measure";

      /** The measure's name. */
      readonly name: string;

      /** The measure's slug. */
      readonly slug: string;
    }
  | {
      /** What kind of node it is. */
      readonly kind: "metric";

      /** The name of the metric it reads. */
      readonly name: string;

      /** The slug of the metric it reads. */
      readonly slug: string;
    };

/** A node's parent: its id, and the operand position the edge shows. */
export interface MetricExpressionParent {
  /** The parent's id. */
  readonly id: string;

  /** The operand position, when the parent's order matters. */
  readonly position?: number | undefined;

  /** The prefix of every id in the metric's subgraph. */
  readonly prefix: string;
}

/** The `metric-expressions` command's options. */
export interface MetricExpressionsCommandOptions {
  /** Fail when the Markdown differs from the database instead of writing it. */
  readonly check?: boolean;

  /** The Markdown file whose marker block holds the diagrams. */
  readonly outputMarkdown?: string;
}

/** What syncing the Markdown file needs: its path, and check-only. */
export interface MetricExpressionsSync {
  /** Fail when the Markdown differs from the database instead of writing it. */
  readonly check: boolean;

  /** The Markdown file whose marker block holds the diagrams. */
  readonly outputMarkdown: string;
}

/** A metric and the root of its expression. */
export interface MetricExpressionTree {
  /** The root of its expression. */
  readonly expression: MetricExpressionNode;

  /** What the metric is called. */
  readonly name: string;

  /** Its name as a URL slug. */
  readonly slug: string;

  /** Its unit: `count`, `duration`, `instant` or `none`. */
  readonly unit: string;
}
