// 🏷️ Types

import type { NeighborhoodEdge } from "../neighborhood/neighborhood.types";

/**
 * The whole-repository Nx dependency graph: every project and every edge.
 */
export interface WorkspaceGraph {
  /** Every edge between two workspace projects, sorted. */
  readonly edges: NeighborhoodEdge[];
  /** Every project name the graph knows, sorted. */
  readonly projectNames: string[];
}
