// 🏷️ Types

/** Whole-workspace file import graph, with each file qualified by project. */
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
