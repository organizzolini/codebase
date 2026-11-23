// 🌎 Utilities

import { truncationParts } from "../graph-tree/graph-tree.utilities";

import { graphDagPageMessage } from "./graph-dag.constants";

import type {
  GraphEdge,
  GraphModel,
} from "../graph-mermaid/graph-mermaid.types";
import type {
  GraphLimits,
  GraphPaging,
} from "../graph-options/graph-options.types";
import type { GraphDagWalk } from "./graph-dag.types";

/**
 * Caps depth and breadth, depth being a node's shortest distance from a root;
 * hidden children become '… K more' nodes with warnings.
 */
export function limitDagGraph(
  graph: GraphModel,
  limits: GraphLimits,
): GraphModel {
  if (
    limits.maximumDepth === undefined &&
    limits.maximumBreadth === undefined
  ) {
    return graph;
  }

  const children = distinctChildren(graph.edges);
  const roots = rootIds(graph);
  const reachable = reachableFrom(roots, children);
  return withoutHidden(graph, {
    reachable,
    walk: walkDag(roots, children, limits),
  });
}

/**
 * Keeps the roots `paging` selects, in node order, with every node reachable
 * from them. A page past the last root keeps nothing and warns.
 */
export function pageDagGraph(
  graph: GraphModel,
  paging: GraphPaging,
): GraphModel {
  const roots = rootIds(graph);
  const start = (paging.page - 1) * paging.limit;
  if (start >= roots.length) {
    return {
      directed: graph.directed,
      edges: [],
      nodes: [],
      warnings: [...graph.warnings, graphDagPageMessage(paging, roots.length)],
    };
  }

  const kept = reachableFrom(
    roots.slice(start, start + paging.limit),
    distinctChildren(graph.edges),
  );
  return {
    directed: graph.directed,
    edges: graph.edges.filter(
      ({ source, target }) => kept.has(source) && kept.has(target),
    ),
    nodes: graph.nodes.filter(({ id }) => kept.has(id)),
    warnings: graph.warnings,
  };
}

/** Each node's distinct children, by its id, in edge order; a self-loop is no child. */
function distinctChildren(
  edges: readonly GraphEdge[],
): ReadonlyMap<string, readonly string[]> {
  const children = new Map<string, Set<string>>();
  for (const { source, target } of edges) {
    if (source === target) continue;
    children.set(source, (children.get(source) ?? new Set()).add(target));
  }
  return new Map(
    [...children].map(([source, targets]) => [source, [...targets]]),
  );
}

/** A key naming the edge between two nodes. */
function edgeKey(source: string, target: string): string {
  return JSON.stringify([source, target]);
}

/** Whether a cap leaves `edge` drawn: removed ends drop it, and reachable ends keep it only if the walk drew it. */
function keepEdge(
  { source, target }: GraphEdge,
  {
    kept,
    reachable,
    removed,
  }: {
    readonly kept: ReadonlySet<string>;
    readonly reachable: ReadonlySet<string>;
    readonly removed: ReadonlySet<string>;
  },
): boolean {
  if (removed.has(source) || removed.has(target)) return false;
  if (!reachable.has(source) || !reachable.has(target)) return true;
  return source === target || kept.has(edgeKey(source, target));
}

/** Every id reachable from `roots`, the roots included. */
function reachableFrom(
  roots: readonly string[],
  children: ReadonlyMap<string, readonly string[]>,
): Set<string> {
  const reached = new Set<string>();
  const pending = [...roots];
  for (let id = pending.pop(); id !== undefined; id = pending.pop()) {
    if (!reached.has(id)) {
      reached.add(id);
      pending.push(...(children.get(id) ?? []));
    }
  }
  return reached;
}

/** The ids of the nodes marked as roots, in node order. */
function rootIds(graph: GraphModel): string[] {
  return graph.nodes
    .filter(({ marker }) => marker === "root")
    .map(({ id }) => id);
}

/** Walks down from `roots` a level at a time, drawing the edges `limits` keep and recording each node whose children they hid. */
function walkDag(
  roots: readonly string[],
  children: ReadonlyMap<string, readonly string[]>,
  { maximumBreadth = Infinity, maximumDepth = Infinity }: GraphLimits,
): GraphDagWalk {
  const walk: GraphDagWalk = {
    kept: new Set(),
    shown: new Set(roots),
    truncations: [],
  };

  let level = [...roots];
  for (let depth = 1; level.length > 0; depth += 1) {
    level = level.flatMap((parent) =>
      walkParent(
        walk,
        { children: children.get(parent) ?? [], parent },
        {
          atDepthLimit: depth >= maximumDepth,
          maximumBreadth,
          maximumDepth,
        },
      ),
    );
  }
  return walk;
}

/**
 * Draws a parent's edges to its children under the caps, recording what they
 * hid, and returns the children it showed for the first time.
 */
function walkParent(
  walk: GraphDagWalk,
  {
    children: all,
    parent,
  }: { readonly children: readonly string[]; readonly parent: string },
  cap: {
    readonly atDepthLimit: boolean;
    readonly maximumBreadth: number;
    readonly maximumDepth: number;
  },
): string[] {
  const drawn = cap.atDepthLimit ? all : all.slice(0, cap.maximumBreadth);
  const fresh: string[] = [];
  let hidden = all.length - drawn.length;
  for (const child of drawn) {
    if (walk.shown.has(child)) {
      walk.kept.add(edgeKey(parent, child));
    } else if (cap.atDepthLimit) {
      hidden += 1;
    } else {
      walk.shown.add(child);
      walk.kept.add(edgeKey(parent, child));
      fresh.push(child);
    }
  }

  if (hidden > 0) {
    walk.truncations.push({
      hidden,
      limit: cap.atDepthLimit ? "--max-depth" : "--max-breadth",
      maximum: cap.atDepthLimit ? cap.maximumDepth : cap.maximumBreadth,
      parent,
    });
  }
  return fresh;
}

/** The graph without nodes the walk hid, with the truncation nodes it made drawn in their place. */
function withoutHidden(
  graph: GraphModel,
  {
    reachable,
    walk: { kept, shown, truncations },
  }: { readonly reachable: ReadonlySet<string>; readonly walk: GraphDagWalk },
): GraphModel {
  const removed = new Set([...reachable].filter((id) => !shown.has(id)));
  const drawn = truncationParts(
    truncations,
    new Set(graph.nodes.map(({ id }) => id)),
  );

  return {
    directed: graph.directed,
    edges: [
      ...graph.edges.filter((edge) =>
        keepEdge(edge, { kept, reachable, removed }),
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
