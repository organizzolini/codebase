// 🌎 Utilities

import { truncationParts } from "../graph-tree/graph-tree.utilities";

import { graphDagPageMessage } from "./graph-dag.constants";
import { edgeKey, graphLinks, reachableFrom } from "./graph-dag.utilities";

import type {
  GraphEdge,
  GraphModel,
} from "../graph-mermaid/graph-mermaid.types";
import type {
  GraphLimits,
  GraphPaging,
} from "../graph-options/graph-options.types";
import type { GraphDagWalk, GraphLinks } from "./graph-dag.types";

/**
 * Caps depth and breadth, depth being a node's shortest distance from a root;
 * hidden children become '… K more' nodes with warnings.
 */
export function limitDagGraph(
  graph: GraphModel,
  limits: GraphLimits,
): GraphModel {
  if (
    limits.truncateDepth === undefined &&
    limits.truncateBreadth === undefined
  ) {
    return graph;
  }

  const links = graphLinks(graph);
  const roots = rootIds(graph);
  return withoutHidden(graph, {
    links,
    reachable: reachableFrom(roots, links),
    walk: walkDag(roots, links, limits),
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
    graphLinks(graph),
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

/** Whether a cap leaves `edge` drawn: removed ends drop it, and reachable ends keep it only if the walk drew it. */
function keepEdge(
  { source, target }: GraphEdge,
  {
    kept,
    links,
    reachable,
    removed,
  }: {
    readonly kept: ReadonlySet<string>;
    readonly links: GraphLinks;
    readonly reachable: ReadonlySet<string>;
    readonly removed: ReadonlySet<string>;
  },
): boolean {
  if (removed.has(source) || removed.has(target)) return false;
  if (!reachable.has(source) || !reachable.has(target)) return true;
  return source === target || kept.has(edgeKey(links.directed, source, target));
}

/** The children a walk from `parent` may draw: an undirected node's discovery parent is none of them. */
function openChildren(
  walk: GraphDagWalk,
  links: GraphLinks,
  parent: string,
): string[] {
  const source = links.directed ? undefined : walk.via.get(parent);
  const open: string[] = [];
  for (const child of links.children.get(parent) ?? []) {
    if (child !== source) open.push(child);
  }
  return open;
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
  links: GraphLinks,
  { truncateBreadth = Infinity, truncateDepth = Infinity }: GraphLimits,
): GraphDagWalk {
  const walk: GraphDagWalk = {
    kept: new Set(),
    shown: new Set(roots),
    truncations: [],
    via: new Map(),
  };

  let level = [...roots];
  for (let depth = 1; level.length > 0; depth += 1) {
    level = level.flatMap((parent) =>
      walkParent(
        walk,
        { links, parent },
        {
          atDepthLimit: depth >= truncateDepth,
          truncateBreadth,
          truncateDepth,
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
  { links, parent }: { readonly links: GraphLinks; readonly parent: string },
  cap: {
    readonly atDepthLimit: boolean;
    readonly truncateBreadth: number;
    readonly truncateDepth: number;
  },
): string[] {
  const all = openChildren(walk, links, parent);
  const drawn = cap.atDepthLimit ? all : all.slice(0, cap.truncateBreadth);
  const fresh: string[] = [];
  let hidden = all.length - drawn.length;
  for (const child of drawn) {
    if (walk.shown.has(child)) {
      walk.kept.add(edgeKey(links.directed, parent, child));
    } else if (cap.atDepthLimit) {
      hidden += 1;
    } else {
      walk.shown.add(child);
      walk.via.set(child, parent);
      walk.kept.add(edgeKey(links.directed, parent, child));
      fresh.push(child);
    }
  }

  if (hidden > 0) {
    walk.truncations.push({
      hidden,
      limit: cap.atDepthLimit ? "--truncate-depth" : "--truncate-breadth",
      maximum: cap.atDepthLimit ? cap.truncateDepth : cap.truncateBreadth,
      parent,
    });
  }
  return fresh;
}

/** The graph without nodes the walk hid, with the truncation nodes it made drawn in their place. */
function withoutHidden(
  graph: GraphModel,
  {
    links,
    reachable,
    walk: { kept, shown, truncations },
  }: {
    readonly links: GraphLinks;
    readonly reachable: ReadonlySet<string>;
    readonly walk: GraphDagWalk;
  },
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
        keepEdge(edge, { kept, links, reachable, removed }),
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
