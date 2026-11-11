// 🏷️ Types

import type { OwnedFindings } from "../project-reports/project-reports.types";
import type { ProjectLimitsLookup } from "@callidescope/configuration";
import type {
  CallableId,
  CallGraphResult,
  CallStack,
  ProjectReport,
  StackFrame,
} from "@callidescope/core";

/** Anything holding a frame list, such as a `CallStack`. */
export interface FramedStack {
  readonly frames: readonly StackFrame[];
}

/** A diagram under construction. Mutable, since stacks add nodes and edges. */
export interface MermaidDiagram {
  readonly edges: Set<string>;
  readonly identifiersByCallable: Map<CallableId, string>;
  readonly nodes: string[];
}

/** One project's index row and the scoreboard's bucketing numbers. */
export interface ProjectIndexRow {
  readonly deepest: number;
  readonly headroom: number;
  readonly limit: number;
  readonly projectName: string;
  readonly widest: number;
}

/** Arguments for rendering only the findings a gate weighs. */
export interface RenderFindingsArguments extends OwnedFindings {
  readonly previewCount: number;
}

/** Arguments for rendering the per-project index and its scoreboard. */
export interface RenderProjectIndexArguments {
  readonly limits: ProjectLimitsLookup;
  readonly projects: readonly ProjectReport[];
}

/** Arguments for rendering one project's section. */
export interface RenderProjectSectionArguments {
  readonly heading: string;
  /** The lookup the whole run resolved, so a project's block and the workspace's view of it cannot disagree on the limit. */
  readonly limits: ProjectLimitsLookup;
  readonly previewCount: number;
  readonly rendering: StackRendering;
  readonly report: ProjectReport;
}

/** Arguments for rendering a whole run. */
export interface RenderRunArguments {
  /** Prose placed under the heading, from the destination that asked for it. */
  readonly description: string | undefined;
  readonly heading: string;
  readonly limits: ProjectLimitsLookup;
  readonly previewCount: number;
  readonly rendering: StackRendering;
  readonly result: CallGraphResult;
}

/** Arguments for rendering a run's stacks, preview then disclosure. */
export interface RenderStacksArguments {
  readonly previewCount: number;
  readonly stacks: readonly CallStack[];
}

/** How a report draws stacks. Excludes `json`, which is no drawing. */
export type StackRendering = "diagram" | "tree";
