// 🏷️ Types

import type { WorkspaceProject } from "../workspace/workspace.types";
import type ts from "typescript";

/** Arguments for building a program for every project in a closure. */
export interface BuildProgramsArguments {
  /**
   * The projects a run was asked to trace. Every one of them gets a program,
   * and so does every project their imports transitively reach.
   */
  readonly startingProjects: readonly WorkspaceProject[];
  /** Every workspace project, so a file a program pulled in can name its owner, even one no starting root mentions. */
  readonly workspaceProjects: readonly WorkspaceProject[];
  readonly workspaceRoot: string;
}

/** The programs a run built, and the ownership decisions behind them. */
export interface ProgramSet {
  /** Absolute real path to the program that owns it. */
  readonly ownerByFilePath: ReadonlyMap<string, ProjectProgram>;
  readonly programs: readonly ProjectProgram[];
}

/**
 * One project's program, its checker, and the files it owns. Each file is walked
 * once, by its owner.
 */
export interface ProjectProgram {
  readonly checker: ts.TypeChecker;
  /** Absolute real paths this program is responsible for walking. */
  readonly ownedFilePaths: ReadonlySet<string>;
  readonly program: ts.Program;
  readonly project: WorkspaceProject;
}
