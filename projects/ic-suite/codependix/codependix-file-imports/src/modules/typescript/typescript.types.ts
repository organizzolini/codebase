// 🏷️ Types

import type ts from "typescript";

/** TypeScript file import graph; edges leaving the project are omitted. */
export interface TypescriptImportGraph {
  /** Every drawn import relationship, sorted so the diagram never churns. */
  readonly edges: TypescriptImportGraphEdge[];
  /** Every source file in the graph, project-relative and sorted. */
  readonly fileNames: string[];
  /** Files left with no drawn edge in either direction. */
  readonly isolatedFileNames: string[];
  /** The project the graph was built from. */
  readonly projectName: string;
}

/** One file importing another, both paths project-relative. */
export interface TypescriptImportGraphEdge {
  readonly source: string;
  readonly target: string;
}

/** A project with a `tsconfig.json`; no tag gates it. */
export interface TypescriptProject {
  /** Absolute path of the project directory. */
  readonly absoluteRoot: string;
  /** Project directory name, which is also the Nx project name. */
  readonly name: string;
  /** Absolute path of the project's `tsconfig.json`. */
  readonly tsconfigPath: string;
}

/** Program, host, and options; import resolution must reuse them. */
export interface TypescriptProjectProgram {
  readonly host: ts.CompilerHost;
  readonly options: ts.CompilerOptions;
  readonly program: ts.Program;
  readonly project: TypescriptProject;
}
