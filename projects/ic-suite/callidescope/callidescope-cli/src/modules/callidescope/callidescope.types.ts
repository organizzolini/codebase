// 🏷️ Types

import type {
  CallidescopeLimitOverrides,
  CallidescopeLimits,
  ProjectLimitsLookup,
  ResolvedCallidescopeConfiguration,
  ResolvedCallidescopeEntryPoints,
  ResolvedCallidescopeWriteConfiguration,
} from "@callidescope/configuration";
import type { CallableId, CallGraphResult } from "@callidescope/core";
import type {
  CallableCollection,
  CallGraph,
  DiscoveredCallable,
  UnresolvedEntryPointAddress,
} from "@callidescope/graph";

/** What analyzing one run's callables produced. */
export interface AnalyzeOutcome {
  /** Depth and breadth limits each traced project is judged against. Held beside the result, not inside it, as with unresolved addresses. */
  readonly projectLimits: ProjectLimitsLookup;
  readonly result: CallGraphResult;
  /** Declared entry-point addresses naming no callable, or more than one. Held beside the result: an unresolved address is a fact about configuration. */
  readonly unresolvedAddresses: readonly UnresolvedEntryPointAddress[];
}

/** Everything one walk of the workspace produced, before any analysis. */
export interface DiscoveredWorkspace extends ProjectDeclarations {
  readonly collection: CallableCollection;
  /** Every project the walk reached, its dependency closure included. */
  readonly projectNames: string[];
  /**
   * Workspace-relative root of each project the run was scoped to, keyed by
   * name — the starting projects, not the closure they reached.
   */
  readonly startingProjectRoots: ReadonlyMap<string, string>;
}

/** The collected callables and their graph, without any analysis run over them. */
export interface LocateOutcome {
  readonly callablesById: ReadonlyMap<CallableId, DiscoveredCallable>;
  readonly graph: CallGraph;
  /** Workspace-relative root of each project the run was scoped to, keyed by name. */
  readonly startingProjectRoots: ReadonlyMap<string, string>;
}

/** What every traced project declared about itself in its own configuration. */
export interface ProjectDeclarations {
  /** Entry-point rules a project declared for itself, keyed by project name. */
  readonly entryPointsByProject: ReadonlyMap<
    string,
    ResolvedCallidescopeEntryPoints
  >;
  /** Exclusion globs each project declared, keyed by project name. A project that declared none is absent, so an empty map excludes nothing. */
  readonly excludeByProject: ReadonlyMap<string, readonly string[]>;
  /** The depth and breadth limits each traced project is judged against. */
  readonly projectLimits: ProjectLimitsLookup;
  /** Destinations each project declared for itself. A project that declared none is absent; presence means it owns its destinations. */
  readonly writeByProject: ReadonlyMap<
    string,
    ResolvedCallidescopeWriteConfiguration
  >;
}

/** Arguments for one full trace of a workspace. */
export interface TraceArguments {
  /** The limits the workspace file wrote, as authored. Resolution defaults `maximumDepth`, so only this names the file for the row. */
  readonly authoredLimits?: CallidescopeLimits | undefined;
  readonly configuration: ResolvedCallidescopeConfiguration;
  /** The file `configuration` was read from. The trace skips it, since one file holds one role per run. */
  readonly configurationPath: string;
  /** Project directories to trace. Every project in the workspace when empty. */
  readonly directories: readonly string[];
  /** Limits this run's command line overrode. Carried into the trace because each project's gate reads its own declared number. */
  readonly limitOverrides?: CallidescopeLimitOverrides | undefined;
  readonly workspaceRoot: string;
}

/** What one trace produced, alongside the projects it covered. */
export interface TraceOutcome extends AnalyzeOutcome {
  /** Every project the run measured, its dependency closure included. */
  readonly projectNames: readonly string[];
  /**
   * Workspace-relative root of each project the run was scoped to, keyed by
   * name — the starting projects, not the closure they reached.
   */
  readonly startingProjectRoots: ReadonlyMap<string, string>;
  /** The destinations each project declared, read once during the trace, so publishing and measuring share one answer. */
  readonly writeByProject: ReadonlyMap<
    string,
    ResolvedCallidescopeWriteConfiguration
  >;
}
