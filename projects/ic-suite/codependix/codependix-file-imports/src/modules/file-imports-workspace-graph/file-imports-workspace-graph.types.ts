// 🏷️ Types

/**
 * The whole-workspace file-level import graph, combining every project's graph.
 * Each file is qualified by its project, since file names alone are not unique.
 */
export interface FileImportsWorkspaceGraph {
  /** Every drawn import relationship, sorted so the diagram never churns. */
  readonly edges: FileImportsWorkspaceGraphEdge[];
  /** Every file in the graph, qualified by project and sorted. */
  readonly fileNames: string[];
}

/** One file importing another, both qualified by the project they belong to. */
export interface FileImportsWorkspaceGraphEdge {
  readonly source: string;
  readonly target: string;
}
