// 🏷️ Types

/** Piece-counting graph of inked nodes, their neighbors, and identity. */
export interface InkAdjacency<Node> {
  readonly key: (node: Node) => string;
  readonly neighbors: (node: Node) => readonly Node[];
  readonly nodes: readonly Node[];
}
