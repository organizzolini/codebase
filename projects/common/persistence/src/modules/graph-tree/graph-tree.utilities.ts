// 🌎 Utilities

import type {
  GraphEdge,
  GraphModel,
  GraphNode,
} from "../graph-mermaid/graph-mermaid.types";
import type { GraphTreeRow, NestedSetRow } from "./graph-tree.types";

/**
 * Builds the directed graph a tree's rows describe: an edge from each parent
 * to each child, and a root marker on every row without a parent. A row whose
 * parent no row has is drawn as a root, and warned about.
 */
export function buildTreeGraph(rows: readonly GraphTreeRow[]): GraphModel {
  const ids = new Set(rows.map(({ id }) => id));
  const warnings: string[] = [];

  const nodes: GraphNode[] = rows.map(({ id, label, parentId }) => {
    if (parentId !== undefined && ids.has(parentId)) return { id, label };
    if (parentId !== undefined) {
      warnings.push(
        `Node ${id} names parent ${parentId}, which no row has; drawn as a root`,
      );
    }
    return { id, label, marker: "root" };
  });

  const edges: GraphEdge[] = rows.flatMap(({ id, parentId }) =>
    parentId === undefined || !ids.has(parentId)
      ? []
      : [{ source: parentId, target: id }],
  );

  return { directed: true, edges, nodes, warnings };
}

/**
 * Finds each nested-set row's parent: the nearest row whose interval encloses
 * its own. Rows are visited in left-bound order, keeping the open intervals.
 */
export function nestedSetParents(
  rows: readonly NestedSetRow[],
): Map<string, string | undefined> {
  const parents = new Map<string, string | undefined>();
  const open: NestedSetRow[] = [];

  for (const row of rows.toSorted((left, right) => left.left - right.left)) {
    let top = open.at(-1);
    while (top !== undefined && top.right < row.left) {
      open.pop();
      top = open.at(-1);
    }
    parents.set(row.id, top?.id);
    open.push(row);
  }

  return parents;
}

/**
 * `value`, which a tree's metadata must have for its storage to be read.
 * @throws Error with `message` when `value` is missing.
 */
export function requireTreeMetadata<Value>(
  value: undefined | Value,
  message: string,
): Value {
  if (value === undefined) throw new Error(message);
  return value;
}
