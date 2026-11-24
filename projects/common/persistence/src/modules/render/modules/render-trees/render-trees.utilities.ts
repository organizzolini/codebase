// 🌎 Utilities

import { truncationParts } from "../render-mermaid/render-mermaid-truncations.utilities";

import { renderTreesPageMessage } from "./render-trees.constants";

import type {
  GraphEdge,
  GraphModel,
  GraphNode,
  GraphTreeTruncation,
} from "../render-mermaid/render-mermaid.types";
import type { GraphPaging } from "../render-options/render-options.types";
import type {
  GraphTreeLimits,
  GraphTreeRow,
  GraphTreeWalk,
} from "./render-trees.types";

/**
 * Builds the directed graph a tree's rows describe. A row whose parent no row
 * has is drawn as a root and warned about.
 */
export function buildTreeGraph(rows: readonly GraphTreeRow[]): GraphModel {
  const ids = new Set(rows.map(({ id }) => id));
  const warnings: string[] = [];

  const nodes: GraphNode[] = rows.map(({ icon, id, label, note, parentId }) => {
    const detail = {
      ...(icon === undefined ? {} : { icon }),
      ...(note === undefined ? {} : { note }),
    };
    if (parentId !== undefined && ids.has(parentId)) {
      return { id, label, ...detail };
    }
    if (parentId !== undefined) {
      warnings.push(
        `Node ${id} names parent ${parentId}, which no row has; drawn as a root`,
      );
    }
    return { id, label, ...detail, marker: "root" };
  });

  const edges: GraphEdge[] = rows.flatMap(({ id, parentId }) =>
    parentId === undefined || !ids.has(parentId)
      ? []
      : [{ source: parentId, target: id }],
  );

  return { directed: true, edges, nodes, warnings };
}

/** The rows whose ids `ids` holds, in their given order. */
export function keepRowsIn(
  rows: readonly GraphTreeRow[],
  ids: ReadonlySet<string>,
): GraphTreeRow[] {
  const drawn: GraphTreeRow[] = [];
  for (const row of rows) {
    if (ids.has(row.id)) drawn.push(row);
  }
  return drawn;
}

/**
 * Caps a tree graph at `limits`: depth hides a node's children, breadth keeps
 * the first in row order. Roots are never breadth-capped.
 */
export function limitTreeGraph(
  graph: GraphModel,
  limits: GraphTreeLimits,
): GraphModel {
  if (
    limits.truncateDepth === undefined &&
    limits.truncateBreadth === undefined
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
 * The ids of each match and its ancestors, so matches show their place. Walks
 * stop at unknown parents and cycles.
 */
export function matchedAncestors(
  rows: readonly GraphTreeRow[],
  matches: ReadonlySet<string>,
): Set<string> {
  const parents = new Map<string, string | undefined>();
  for (const { id, parentId } of rows) parents.set(id, parentId);

  const kept = new Set<string>();
  for (const match of matches) {
    let id: string | undefined = match;
    while (id !== undefined && parents.has(id) && !kept.has(id)) {
      kept.add(id);
      id = parents.get(id);
    }
  }
  return kept;
}

/**
 * The ids of each match and its descendants, so matches draw their whole
 * subtree. Each row joins once, so a cycle ends its walk.
 */
export function matchedSubtrees(
  rows: readonly GraphTreeRow[],
  matches: ReadonlySet<string>,
): Set<string> {
  const children = new Map<string, string[]>();
  for (const { id, parentId } of rows) {
    if (parentId === undefined) continue;
    const ids = children.get(parentId);
    if (ids === undefined) children.set(parentId, [id]);
    else ids.push(id);
  }

  const subtree = new Set(matches);
  const pending = [...matches];
  for (let id = pending.pop(); id !== undefined; id = pending.pop()) {
    for (const child of children.get(id) ?? []) {
      if (!subtree.has(child)) {
        subtree.add(child);
        pending.push(child);
      }
    }
  }
  return subtree;
}

/**
 * The rows in `rank` order, where `rank` lists row ids in sort order; omitted
 * rows sort last.
 */
export function orderRowsByRank(
  rows: readonly GraphTreeRow[],
  rank: readonly string[],
): GraphTreeRow[] {
  const unplaced = new Map<string, GraphTreeRow>();
  for (const row of rows) unplaced.set(row.id, row);

  const ordered: GraphTreeRow[] = [];
  for (const id of rank) {
    const row = unplaced.get(id);
    if (row !== undefined) {
      ordered.push(row);
      unplaced.delete(id);
    }
  }
  for (const row of rows) {
    if (unplaced.has(row.id)) ordered.push(row);
  }
  return ordered;
}

/**
 * Keeps the roots `paging` selects, with their descendants.
 * A page past the last root keeps none and warns.
 */
export function pageTreeRows(
  rows: readonly GraphTreeRow[],
  paging: GraphPaging,
): { readonly rows: GraphTreeRow[]; readonly warning?: string } {
  const ids = new Set(rows.map(({ id }) => id));
  const roots = rows
    .filter(({ parentId }) => parentId === undefined || !ids.has(parentId))
    .map(({ id }) => id);

  const start = (paging.page - 1) * paging.limit;
  if (start >= roots.length) {
    return {
      rows: [],
      warning: renderTreesPageMessage(paging, roots.length),
    };
  }

  const selected = roots.slice(start, start + paging.limit);
  return { rows: keepRowsIn(rows, subtreeIds(rows, selected)) };
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
    const targets = children.get(source);
    if (targets === undefined) children.set(source, [target]);
    else targets.push(target);
  }
  return children;
}

/**
 * The children a node shows at `depth`: none past `truncateDepth`, else its
 * first `truncateBreadth`.
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
  const { truncateBreadth, truncateDepth } = limits;
  if (truncateDepth !== undefined && node.depth >= truncateDepth) {
    return {
      shown: [],
      truncation: {
        hidden: childIds.length,
        limit: "--truncate-depth",
        maximum: truncateDepth,
        parent,
      },
    };
  }
  if (truncateBreadth === undefined || childIds.length <= truncateBreadth) {
    return { shown: childIds };
  }
  return {
    shown: childIds.slice(0, truncateBreadth),
    truncation: {
      hidden: childIds.length - truncateBreadth,
      limit: "--truncate-breadth",
      maximum: truncateBreadth,
      parent,
    },
  };
}

/**
 * The ids of each root and its descendants, found through parent ids.
 * A cycle ends its walk.
 */
function subtreeIds(
  rows: readonly GraphTreeRow[],
  roots: readonly string[],
): Set<string> {
  const ids = new Set(rows.map(({ id }) => id));
  const edges = rows.flatMap(({ id, parentId }) =>
    parentId === undefined || !ids.has(parentId)
      ? []
      : [{ source: parentId, target: id }],
  );
  const children = childrenByParent(edges);

  const kept = new Set<string>();
  const pending = [...roots];
  for (let id = pending.pop(); id !== undefined; id = pending.pop()) {
    if (!kept.has(id)) {
      kept.add(id);
      for (const child of children.get(id) ?? []) pending.push(child);
    }
  }
  return kept;
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
