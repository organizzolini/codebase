// 🌎 Utilities

import type {
  GraphEdge,
  GraphNode,
  GraphTreeTruncation,
} from "./render-mermaid.types";

/**
 * The truncation nodes, edges, and warnings drawn for `truncations`, each node
 * under its parent with an id unused in `taken`.
 */
export function truncationParts(
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

/** A truncation node's id under `parent`, unused by any node in `taken`. */
function truncationId(parent: string, taken: Set<string>): string {
  let id = `${parent}/more`;
  for (let suffix = 2; taken.has(id); suffix += 1) {
    id = `${parent}/more-${String(suffix)}`;
  }
  taken.add(id);
  return id;
}
