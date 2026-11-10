// 🏷️ Types

/**
 * The whole-workspace NestJS module graph, combining every project's module graph.
 * Each node is qualified by project, since module class names are not unique.
 */
export interface NestjsModulesWorkspaceGraph {
  /** Every drawn import relationship, sorted so the diagram never churns. */
  readonly edges: NestjsModulesWorkspaceGraphEdge[];
  /** Every module in the graph, qualified by project and sorted. */
  readonly moduleNames: string[];
}

/** One module importing another, both qualified by the project they belong to. */
export interface NestjsModulesWorkspaceGraphEdge {
  readonly source: string;
  readonly target: string;
}
