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

/** One graph type's whole-workspace data, kept even without a workspace destination. */
export interface CombinedGraphEntry {
  json: unknown;
  markdown: string;
}

/** Each active graph type's workspace data; absent types were not active. */
export type CombinedGraphExports = Partial<
  Record<CodependixGraphType, CombinedGraphEntry>
>;

/** Written JSON shape of the file-import workspace export, same as `FileImportsWorkspaceGraph`. */
export type FileImportsWorkspaceGraphExport = FileImportsWorkspaceGraph;

/** One graph type's pass outcome; `workspaceEntry` is undefined if not built. */
export interface GraphTypePassOutcome extends GraphRunOutcome {
  workspaceEntry: CombinedGraphEntry | undefined;
}

/** What `GraphRunService.run` resolves: delivery outcome and combined-output data. */
export interface MapRunResult {
  combinedGraphs: CombinedGraphExports;
  outcome: GraphRunOutcome;
}

/** One project's NestJS module graph export, kept apart from `NestjsModuleGraph`. */
export type NestjsModuleGraphExport = NestjsModuleGraph;

/** Whole-workspace NestJS module export, kept as its own named type. */
export type NestjsModulesWorkspaceGraphExport = NestjsModulesWorkspaceGraph;

/** The JSON shape a single project's Nx neighborhood export is written as. */
export interface NxNeighborhoodExport {
  dependencies: string[];
  dependents: string[];
  edges: Neighborhood["edges"];
  projectName: string;
}

/** Whole-workspace Nx project export, kept apart from `WorkspaceGraph`. */
export type NxWorkspaceGraphExport = WorkspaceGraph;

/** One project's Python file-level import export, kept apart from `PythonImportGraph`. */
export type PythonImportGraphExport = PythonImportGraph;

/** One project's TypeScript file import export, kept apart from `TypescriptImportGraph`. */
export type TypescriptImportGraphExport = TypescriptImportGraph;
