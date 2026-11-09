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

/**
 * Anything holding a frame list, such as a full `CallStack` or a path with no depth of its own.
 */
export interface FramedStack {
  readonly frames: readonly StackFrame[];
}

/**
 * A diagram under construction. Mutable on purpose, since nodes and edges accumulate across every
 * stack drawn.
 */
export interface MermaidDiagram {
  readonly edges: Set<string>;
  readonly identifiersByCallable: Map<CallableId, string>;
  readonly nodes: string[];
}

/** One project's row in the index, and the numbers the scoreboard buckets it by. */
export interface ProjectIndexRow {
  readonly deepest: number;
  readonly headroom: number;
  readonly limit: number;
  readonly projectName: string;
  readonly widest: number;
}

/**
 * Arguments for rendering only the findings a gate weighs, not the whole run it measured.
 */
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

/** How a report draws its stacks. Narrower than the output format: `json` is a different report, not a drawing of this one. */
export type StackRendering = "diagram" | "tree";
