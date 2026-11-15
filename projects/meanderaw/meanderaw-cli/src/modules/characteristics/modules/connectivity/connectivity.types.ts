// 🏷️ Types

/** An edge's two points, equal for a one-column wrapped east edge. */
export interface CodeEdge {
  readonly from: string;
  readonly to: string;
}

/** One repeat's ink as a graph: pieces, loops, and terminal points. */
export interface Connectivity {
  readonly components: number;
  readonly cycles: number;
  readonly freeEnds: number;
}
