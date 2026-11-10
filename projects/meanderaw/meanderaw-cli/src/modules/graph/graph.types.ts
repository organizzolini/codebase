// 🏷️ Types

/**
 * A graph in the terms piece-counting needs: nodes carrying ink, their
 * neighbors, and a node identity.
 */
export interface InkAdjacency<Node> {
  readonly key: (node: Node) => string;
  readonly neighbors: (node: Node) => readonly Node[];
  readonly nodes: readonly Node[];
}
