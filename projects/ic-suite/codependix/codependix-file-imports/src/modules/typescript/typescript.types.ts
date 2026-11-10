// 🏷️ Types

import type ts from "typescript";

/**
 * A TypeScript project's internal file-level import graph. Edges to files outside the
 * project, such as packages or other workspace projects, are left out.
 */
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

/**
 * A workspace project with its own `tsconfig.json`. Every such project is a candidate,
 * unlike the NestJS module's tag-gated projects.
 */
export interface TypescriptProject {
  /** Absolute path of the project directory. */
  readonly absoluteRoot: string;
  /** Project directory name, which is also the Nx project name. */
  readonly name: string;
  /** Absolute path of the project's `tsconfig.json`. */
  readonly tsconfigPath: string;
}

/**
 * One project's program with the host and options that built it. Import resolution
 * must use the same pair.
 */
export interface TypescriptProjectProgram {
  readonly host: ts.CompilerHost;
  readonly options: ts.CompilerOptions;
  readonly program: ts.Program;
  readonly project: TypescriptProject;
}
