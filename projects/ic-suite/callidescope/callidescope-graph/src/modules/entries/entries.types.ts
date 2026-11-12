// 🏷️ Types

import type { UnresolvedCallableAddress } from "../callables/address.types";
import type { DiscoveredCallable } from "../callables/callables.types";
import type { CallGraph } from "../graph/graph.types";
import type { ResolvedCallidescopeEntryPoints } from "@callidescope/configuration";
import type { CallableId, EntryPoint } from "@callidescope/core";

/** What a pass that reads a project's rules works over. */
export interface ClassificationPassArguments extends EntryPointPassArguments {
  /** The rules for a project the workspace configuration speaks for. */
  readonly defaultRules: ProjectEntryRules;
  readonly rulesByProject: ReadonlyMap<string, ProjectEntryRules>;
}

/** The roots a run will measure depth from. */
export interface EntryPointCollection {
  readonly entryPoints: readonly EntryPoint[];
  /** Declared addresses naming no callable, or more than one. Returned, not skipped: a silently dropped root loosens the gate. */
  readonly unresolvedAddresses: readonly UnresolvedEntryPointAddress[];
}

/** Run arguments, plus the roots and claims passes accumulate. */
export interface EntryPointPassArguments {
  /** Callables some pass has already rooted, so no later one roots them twice. */
  readonly claimed: Set<CallableId>;
  readonly entryPoints: EntryPoint[];
  readonly resolveArguments: ResolveEntriesArguments;
}

/** Entry-point rules, with decorator names in a set, built once. */
export interface ProjectEntryRules {
  readonly decorators: ReadonlySet<string>;
  readonly includeExportedFunctions: boolean;
  readonly includeOrphans: boolean;
}

/** Arguments for deciding which callables root a call stack. */
export interface ResolveEntriesArguments {
  readonly callablesById: ReadonlyMap<CallableId, DiscoveredCallable>;
  /**
   * The rules a project with no configuration of its own is judged by — the
   * workspace configuration's.
   */
  readonly entryPoints: ResolvedCallidescopeEntryPoints;
  /**
   * The rules a project declared for itself, keyed by project name. A project
   * absent here is judged by `entryPoints`.
   */
  readonly entryPointsByProject: ReadonlyMap<
    string,
    ResolvedCallidescopeEntryPoints
  >;
  readonly graph: CallGraph;
  readonly workspaceRoot: string;
}

/** A declared entry-point address that did not name exactly one callable. */
export interface UnresolvedEntryPointAddress {
  readonly address: string;
  /**
   * The project whose configuration declared it. Absent when the workspace
   * configuration did, which has no project to name.
   */
  readonly projectName: string | undefined;
  /** Why it named no single callable, and what it could have meant instead. */
  readonly resolution: UnresolvedCallableAddress;
}
