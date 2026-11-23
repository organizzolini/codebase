// 🌎 Utilities

import { findDagCycles } from "./graph-dag-cycles.utilities";
import { graphDagCycleMessage } from "./graph-dag.constants";

import type { GraphEdgeMetadata } from "../graph-entities/graph-entities.types";
import type {
  GraphEdge,
  GraphModel,
  GraphNode,
} from "../graph-mermaid/graph-mermaid.types";
import type { GraphDagEdge, GraphLinks } from "./graph-dag.types";

/**
 * Builds nodes in first-seen order; a directed graph's roots are unpointed-at
 * nodes, a `@Graph` then roots unreached ones, and a `@Dag` warns per cycle.
 */
export function buildEdgeGraph(
  rows: readonly GraphDagEdge[],
  { directed, kind }: Pick<GraphEdgeMetadata, "directed" | "kind">,
): GraphModel {
  const edges = directed ? rows : distinctLinks(rows);
  const ids = [
    ...new Set(edges.flatMap(({ source, target }) => [source, target])),
  ];
  const starts = new Set(startIds(ids, edges, { directed, kind }));
  return {
    directed,
    edges: edges.map((item) => modelEdge(item)),
    nodes: ids.map((id): GraphNode =>
      starts.has(id) ? { id, label: id, marker: "root" } : { id, label: id },
    ),
    warnings:
      kind === "dag"
        ? findDagCycles(edges).map((cycle) => graphDagCycleMessage(cycle))
        : [],
  };
}

/** The children `node` links to, in edge order; none when it links to nothing. */
export function childrenOf(
  { children }: GraphLinks,
  node: string,
): readonly string[] {
  return children.get(node) ?? [];
}

/** A key naming an edge: undirected, it is the same from either end. */
export function edgeKey(
  directed: boolean,
  source: string,
  target: string,
): string {
  return JSON.stringify(
    directed ? [source, target] : [source, target].toSorted(),
  );
}

/** The links of a graph model, which its edges and direction give. */
export function graphLinks(graph: GraphModel): GraphLinks {
  return linksOf(graph.edges, graph.directed);
}

/**
 * The links `edges` make: each node's distinct children in edge order, a
 * self-loop being no child, and an undirected edge linking both ways.
 */
export function linksOf(
  edges: readonly Pick<GraphEdge, "source" | "target">[],
  directed: boolean,
): GraphLinks {
  const children = new Map<string, Set<string>>();
  const link = (source: string, target: string): void => {
    children.set(
      source,
      (children.get(source) ?? new Set<string>()).add(target),
    );
  };
  for (const { source, target } of edges) {
    if (source === target) continue;
    link(source, target);
    if (!directed) link(target, source);
  }
  return {
    children: new Map<string, readonly string[]>(
      [...children].map(([id, targets]) => [id, [...targets]]),
    ),
    directed,
  };
}

/** Every id reachable from `roots` along `links`, the roots included. */
export function reachableFrom(
  roots: readonly string[],
  links: GraphLinks,
): Set<string> {
  const reached = new Set<string>();
  const pending = [...roots];
  for (let id = pending.pop(); id !== undefined; id = pending.pop()) {
    if (!reached.has(id)) {
      reached.add(id);
      for (const child of childrenOf(links, id)) pending.push(child);
    }
  }
  return reached;
}

/** An undirected link's first row in sort order; a row naming the same link from its other end is dropped. */
function distinctLinks(rows: readonly GraphDagEdge[]): GraphDagEdge[] {
  const seen = new Set<string>();
  return rows.filter(({ source, target }) => {
    const key = edgeKey(false, source, target);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The model's edge for `edge`, carrying its label and weight when it has them. */
function modelEdge({ label, source, target, weight }: GraphDagEdge): GraphEdge {
  return {
    ...(label === undefined ? {} : { label }),
    source,
    target,
    ...(weight === undefined ? {} : { weight }),
  };
}

/**
 * A walk's start ids: a directed graph's unpointed-at nodes, then, for a
 * `@Graph`, each smallest unreached node in turn.
 */
function startIds(
  ids: readonly string[],
  edges: readonly GraphDagEdge[],
  { directed, kind }: Pick<GraphEdgeMetadata, "directed" | "kind">,
): string[] {
  const pointedAt = new Set(
    edges
      .filter(({ source, target }) => source !== target)
      .map(({ target }) => target),
  );
  const starts = directed ? ids.filter((id) => !pointedAt.has(id)) : [];
  if (kind === "dag") return starts;

  const links = linksOf(edges, directed);
  const reached = reachableFrom(starts, links);
  for (const id of ids.toSorted()) {
    if (reached.has(id)) continue;
    starts.push(id);
    for (const other of reachableFrom([id], links)) reached.add(other);
  }
  return starts;
}
