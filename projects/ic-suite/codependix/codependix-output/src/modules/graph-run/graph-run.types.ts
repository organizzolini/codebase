// 🏷️ Types

import type { CodependixGraphType } from "@codependix/configuration";
import type { GraphRunOutcome } from "@codependix/core";
import type {
  FileImportsWorkspaceGraph,
  PythonImportGraph,
  TypescriptImportGraph,
} from "@codependix/file-imports";
import type {
  NestjsModuleGraph,
  NestjsModulesWorkspaceGraph,
} from "@codependix/nestjs-modules";
import type { Neighborhood, WorkspaceGraph } from "@codependix/nx-projects";

/**
 * One graph type's whole-workspace data, captured once per run for combined
 * output, captured even without a workspace destination, so output flags always work.
 */
export interface CombinedGraphEntry {
  json: unknown;
  markdown: string;
}

/**
 * Every active graph type's whole-workspace data, keyed by type. A type absent
 * here was not active for the run.
 */
export type CombinedGraphExports = Partial<
  Record<CodependixGraphType, CombinedGraphEntry>
>;

/**
 * The JSON shape the whole-workspace file-import graph export is written as.
 * Identical to `FileImportsWorkspaceGraph`, kept as its own named type.
 */
export type FileImportsWorkspaceGraphExport = FileImportsWorkspaceGraph;

/**
 * One graph type's pass outcome. `workspaceEntry` is `undefined` when the pass built no
 * whole-workspace graph.
 */
export interface GraphTypePassOutcome extends GraphRunOutcome {
  workspaceEntry: CombinedGraphEntry | undefined;
}

/**
 * What `GraphRunService.run` resolves: the usual delivery outcome, and every
 * active graph type's whole-workspace data for combined output — see
 * `CombinedGraphExports`.
 */
export interface MapRunResult {
  combinedGraphs: CombinedGraphExports;
  outcome: GraphRunOutcome;
}

/**
 * A single project's NestJS module graph export. Identical to
 * `NestjsModuleGraph`, kept separate so the export can evolve alone.
 */
export type NestjsModuleGraphExport = NestjsModuleGraph;

/**
 * The whole-workspace NestJS module graph export. Identical to
 * `NestjsModulesWorkspaceGraph`, kept as its own named type.
 */
export type NestjsModulesWorkspaceGraphExport = NestjsModulesWorkspaceGraph;

/** The JSON shape a single project's Nx neighborhood export is written as. */
export interface NxNeighborhoodExport {
  dependencies: string[];
  dependents: string[];
  edges: Neighborhood["edges"];
  projectName: string;
}

/**
 * The whole-workspace Nx project graph export. Identical to `WorkspaceGraph`,
 * kept as its own named type so the export's shape can evolve separately.
 */
export type NxWorkspaceGraphExport = WorkspaceGraph;

/**
 * A single project's Python file-level import graph export. Identical to
 * `PythonImportGraph`, kept as its own named type.
 */
export type PythonImportGraphExport = PythonImportGraph;

/**
 * A single project's TypeScript file import graph export. Identical to
 * `TypescriptImportGraph`, kept separate so it can evolve alone.
 */
export type TypescriptImportGraphExport = TypescriptImportGraph;
