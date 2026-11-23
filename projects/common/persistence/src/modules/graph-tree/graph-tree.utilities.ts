// 🌎 Utilities

import type {
  GraphEdge,
  GraphModel,
  GraphNode,
} from "../graph-mermaid/graph-mermaid.types";
import type {
  GraphTreeLimits,
  GraphTreeRow,
  GraphTreeTruncation,
  GraphTreeWalk,
  NestedSetRow,
} from "./graph-tree.types";

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
 * Caps a tree graph at `limits`. Roots are level 1 and never capped by
 * breadth. A node past `maximumDepth` hides all its children, and a node with more
 * than `maximumBreadth` children keeps the first ones in row order and hides the
 * rest. Each hidden group is drawn as one "… K more" truncation node under its
 * parent, and warned about. Nodes no root reaches, such as a cycle, stay as drawn.
 */
export function limitTreeGraph(
  graph: GraphModel,
  limits: GraphTreeLimits,
): GraphModel {
  if (
    limits.maximumDepth === undefined &&
    limits.maximumBreadth === undefined
  ) {
    return graph;
  }

  const { removed, truncations } = capTree(graph, limits);
  const drawn = truncationParts(
    truncations,
    new Set(graph.nodes.map(({ id }) => id)),
  );

  return {
    directed: graph.directed,
    edges: [
      ...graph.edges.filter(
        ({ source, target }) => !removed.has(source) && !removed.has(target),
      ),
      ...drawn.edges,
    ],
    nodes: [
      ...graph.nodes.filter(({ id }) => !removed.has(id)),
      ...drawn.nodes,
    ],
    warnings: [...graph.warnings, ...drawn.warnings],
  };
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

/**
 * The ids a cap removes: those reachable from a root that its walk does not
 * show. Also returns the truncations the walk made.
 */
function capTree(
  graph: GraphModel,
  limits: GraphTreeLimits,
): {
  readonly removed: ReadonlySet<string>;
  readonly truncations: readonly GraphTreeTruncation[];
} {
  const children = childrenByParent(graph.edges);
  const roots = graph.nodes
    .filter(({ marker }) => marker === "root")
    .map(({ id }) => id);
  const reached = walkTree(roots, children, {}).shown;
  const { shown, truncations } = walkTree(roots, children, limits);
  const removed = new Set([...reached].filter((id) => !shown.has(id)));
  return { removed, truncations };
}

/** Each node's children, by its id, in the order its edges name them. */
function childrenByParent(
  edges: readonly GraphEdge[],
): ReadonlyMap<string, readonly string[]> {
  const children = new Map<string, string[]>();
  for (const { source, target } of edges) {
    children.set(source, [...(children.get(source) ?? []), target]);
  }
  return children;
}

/**
 * The children a node shows under `depth`, and the truncation that hides the
 * rest. A node past `maximumDepth` shows none; one past `maximumBreadth` shows its first.
 */
function childrenToShow(
  node: { readonly depth: number; readonly id: string },
  childIds: readonly string[],
  limits: GraphTreeLimits,
): {
  readonly shown: readonly string[];
  readonly truncation?: GraphTreeTruncation;
} {
  if (childIds.length === 0) return { shown: [] };

  const parent = node.id;
  const { maximumBreadth, maximumDepth } = limits;
  if (maximumDepth !== undefined && node.depth >= maximumDepth) {
    return {
      shown: [],
      truncation: {
        hidden: childIds.length,
        limit: "--max-depth",
        maximum: maximumDepth,
        parent,
      },
    };
  }
  if (maximumBreadth === undefined || childIds.length <= maximumBreadth) {
    return { shown: childIds };
  }
  return {
    shown: childIds.slice(0, maximumBreadth),
    truncation: {
      hidden: childIds.length - maximumBreadth,
      limit: "--max-breadth",
      maximum: maximumBreadth,
      parent,
    },
  };
}

/** A truncation node's id under `parent`, unused by any node in `taken`. */
function truncationId(parent: string, taken: Set<string>): string {
  let id = `${parent}/more`;
  for (let suffix = 2; taken.has(id); suffix += 1) {
    id = `${parent}/more-${String(suffix)}`;
  }
  taken.add(id);
  return id;
}

/**
 * The truncation nodes, edges, and warnings drawn for `truncations`, each node
 * under its parent with an id unused in `taken`.
 */
function truncationParts(
  truncations: readonly GraphTreeTruncation[],
  taken: Set<string>,
): {
  readonly edges: GraphEdge[];
  readonly nodes: GraphNode[];
  readonly warnings: string[];
} {
  const edges: GraphEdge[] = [];
  const nodes: GraphNode[] = [];
  const warnings: string[] = [];

  for (const { hidden, limit, maximum, parent } of truncations) {
    const id = truncationId(parent, taken);
    nodes.push({ id, label: `… ${hidden} more`, marker: "truncation" });
    edges.push({ source: parent, target: id });
    warnings.push(
      `Node ${parent} hides ${hidden} ${hidden === 1 ? "child" : "children"} beyond ${limit} ${maximum}`,
    );
  }

  return { edges, nodes, warnings };
}

/**
 * Walks down from `roots` under `limits`, showing each root and every child
 * the limits keep, and recording each node whose children they hid.
 */
function walkTree(
  roots: readonly string[],
  children: ReadonlyMap<string, readonly string[]>,
  limits: GraphTreeLimits,
): GraphTreeWalk {
  const shown = new Set(roots);
  const truncations: GraphTreeTruncation[] = [];
  const pending: { depth: number; id: string }[] = [];
  for (const id of roots.toReversed()) pending.push({ depth: 1, id });

  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    const { shown: shownChildren, truncation } = childrenToShow(
      next,
      children.get(next.id) ?? [],
      limits,
    );
    if (truncation !== undefined) truncations.push(truncation);
    for (const id of shownChildren) shown.add(id);
    for (const id of shownChildren.toReversed()) {
      pending.push({ depth: next.depth + 1, id });
    }
  }

  return { shown, truncations };
}
