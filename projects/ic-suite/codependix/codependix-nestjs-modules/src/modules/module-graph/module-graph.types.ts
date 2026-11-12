// 🏷️ Types

/** NestJS module graph of one project, as names and edges. */
export interface NestjsModuleGraph {
  /**
   * Modules every other module imports. Their edges are left out, so the
   * diagram looks sparser than the container.
   */
  readonly ambientModuleNames: string[];
  /** Every drawn import relationship, sorted so the diagram is stable. */
  readonly edges: NestjsModuleGraphEdge[];
  /** Modules left with no drawn edge in either direction. */
  readonly isolatedModuleNames: string[];
  /** Every module node in the graph, sorted. */
  readonly nodes: NestjsModuleGraphNode[];
  /** The project the graph was built from. */
  readonly projectName: string;
}

/** One module importing another. */
export interface NestjsModuleGraphEdge {
  readonly source: string;
  readonly target: string;
}

/** One module in a NestJS project's module import graph. */
export interface NestjsModuleGraphNode {
  /** Path to the file declaring the module class, relative to the project root. */
  readonly declaringFile: string;
  /** The module class name. */
  readonly name: string;
}
