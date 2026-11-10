// 🏷️ Types

import type { PLUGIN_CONTEXT_GLOBAL_KEY } from "./plugin.constants";
import type { CallidescopeOutputFormat } from "@callidescope/configuration";
import type { OwnedFindings } from "@callidescope/output";
import type { INestApplicationContext } from "@nestjs/common";

/** The scoping options every executor in this plugin accepts. */
export interface ExecutorScopeOptions {
  readonly projects?: string[] | undefined;
  readonly tags?: string[] | undefined;
  readonly withDependencies?: boolean | undefined;
}

/** A target this plugin infers onto a project. */
export interface InferredTarget {
  readonly cache: boolean;
  readonly executor: string;
  /** Files whose change must invalidate the cached result. */
  readonly inputs?: string[];
  readonly options: Record<string, unknown>;
}

/** One project's inferred targets, keyed by target name. */
export type InferredTargets = Record<string, InferredTarget>;

/** Arguments for inferring targets across every project in a workspace. */
export interface InferTargetsArguments {
  readonly options: unknown;
  /** Every `project.json` Nx matched, workspace-root relative. */
  readonly projectConfigurationFiles: readonly string[];
  readonly workspaceRoot: string;
}

/** `globalThis`, widened with the slot the plugin caches its context in. */
export type PluginContextGlobal = typeof globalThis & {
  [PLUGIN_CONTEXT_GLOBAL_KEY]?: Promise<INestApplicationContext>;
};

/** What a selection of Nx projects resolved to before a trace runs. */
export interface ResolvedTraceScope {
  /** Workspace-relative directories to hand `callidescope --directories`. */
  readonly directories: string[];
  /** Every project name the workspace has, for naming an unknown one back. */
  readonly knownNames: string[];
  /** Every tag the workspace carries, for naming an unmatched one back. */
  readonly knownTags: string[];
  /** Every project the selection reached, including pulled-in dependencies. */
  readonly projectNames: string[];
  /** Directories of the projects the selection named, before dependency widening. What a verdict covers, not what a trace reads. */
  readonly selectedDirectories: string[];
  /** Names the workspace does not have. */
  readonly unknownNames: string[];
  /** Tags no project in the workspace carries. */
  readonly unmatchedTags: string[];
}

/** Arguments for resolving what one executor invocation should trace. */
export interface ResolveTraceScopeArguments {
  /** Names from the executor's `projects` option. Empty selects nothing. */
  readonly projectNames: readonly string[];
  /** Tags from the executor's `tags` option. Empty selects nothing. */
  readonly tags: readonly string[];
  /** Whether the selection widens along the Nx dependency graph. */
  readonly withDependencies: boolean;
}

/** The trace's arguments without `format`, since a gate's output is the findings that decided its exit code. */
export type RunGateArguments = Omit<RunTraceArguments, "format">;

/** Arguments for gating several tasks from one trace. */
export interface RunGateBatchArguments {
  /** The workspace configuration file, as this plugin's registration names it. */
  readonly configurationPath: string;
  readonly tasks: readonly RunGateBatchTask[];
  readonly workspaceRoot: string;
}

/** One task of a gate batch: the projects it reads and the ones it answers for. */
export interface RunGateBatchTask {
  /** Workspace-relative directories the task's trace reads. */
  readonly directories: readonly string[];
  /** Nx's id for the task, which the result is keyed by. */
  readonly id: string;
  /** What the task judges, a subset of its `directories`. */
  readonly judgedProjectNames: readonly string[];
}

/** Arguments for tracing one resolved selection. */
export interface RunTraceArguments {
  /** The workspace configuration file, as this plugin's registration names it. */
  readonly configurationPath: string;
  readonly directories: readonly string[];
  /** What the run prints. Defaults to markdown when omitted. */
  readonly format?: CallidescopeOutputFormat | undefined;
  /** Projects whose findings decide the verdict: a subset of `directories`, named by callidescope's own project roots, not Nx names. */
  readonly judgedProjectNames: readonly string[];
  readonly workspaceRoot: string;
}

/** The outcome of tracing one selection. */
export interface RunTraceResult {
  readonly ok: boolean;
  readonly report: string;
}

/**
 * What one predicate decided about a traced result. `reason` explains a verdict the findings
 * cannot, such as a run that read nothing.
 */
export interface RunVerdict {
  readonly findings: OwnedFindings;
  /** Whether every rule both targets share was cleared. */
  readonly ok: boolean;
  readonly reason: string | undefined;
  /** Judged projects none of whose own files were read. A `gate` fails on this and a `trace` prints it and passes. */
  readonly unreadProjectNames: readonly string[];
}
