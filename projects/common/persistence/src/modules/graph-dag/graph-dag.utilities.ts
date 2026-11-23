// 🌎 Utilities

import { findDagCycles } from "./graph-dag-cycles.utilities";
import { graphDagCycleMessage } from "./graph-dag.constants";

import type {
  GraphEdge,
  GraphModel,
  GraphNode,
} from "../graph-mermaid/graph-mermaid.types";
import type { GraphDagEdge } from "./graph-dag.types";

/**
 * Builds a directed graph from edges: nodes are distinct endpoints in first-seen
 * order, roots have no incoming edge, and each cycle warns.
 */
export function buildDagGraph(edges: readonly GraphDagEdge[]): GraphModel {
  const targets = new Set(edges.map(({ target }) => target));
  const seen = new Set<string>();
  const nodes: GraphNode[] = [];
  for (const { source, target } of edges) {
    for (const id of [source, target]) {
      if (seen.has(id)) continue;
      seen.add(id);
      nodes.push(
        targets.has(id) ? { id, label: id } : { id, label: id, marker: "root" },
      );
    }
  }

  return {
    directed: true,
    edges: edges.map((edge) => modelEdge(edge)),
    nodes,
    warnings: findDagCycles(edges).map((cycle) => graphDagCycleMessage(cycle)),
  };
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
