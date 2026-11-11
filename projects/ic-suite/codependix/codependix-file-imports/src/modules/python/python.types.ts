// 🏷️ Types

/** Python file import graph, shaped like the TypeScript one. */
export interface PythonImportGraph {
  /** Every drawn import relationship, sorted so the diagram never churns. */
  readonly edges: PythonImportGraphEdge[];
  /** Every source file in the graph, project-relative and sorted. */
  readonly fileNames: string[];
  /** Files left with no drawn edge in either direction. */
  readonly isolatedFileNames: string[];
  /** The project the graph was built from. */
  readonly projectName: string;
}

/** One file importing another, both paths project-relative. */
export interface PythonImportGraphEdge {
  readonly source: string;
  readonly target: string;
}

/** A project tagged `language:python`; no marker file identifies one. */
export interface PythonProject {
  /** Absolute path of the project directory. */
  readonly absoluteRoot: string;
  /** Project directory name, which is also the Nx project name. */
  readonly name: string;
}
