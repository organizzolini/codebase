// 🏷️ Types

import type {
  ProjectLimitsLookup,
  ResolvedCallidescopeConfiguration,
  ResolvedCallidescopeWriteConfiguration,
} from "@callidescope/configuration";
import type { CallGraphResult, ProjectReport } from "@callidescope/core";

/** Arguments for writing every configured destination. */
export interface SyncDestinationsArguments {
  readonly check: boolean;
  readonly configuration: ResolvedCallidescopeConfiguration;
  /** The depth and breadth limits each traced project is judged against. */
  readonly projectLimits: ProjectLimitsLookup;
  readonly result: CallGraphResult;
  /** Root of each scoped project, keyed by name. Only these get a published section, never a measured-only dependency. */
  readonly startingProjectRoots: ReadonlyMap<string, string>;
  /** Destinations each project declared, by name. A project publishing nothing names `markdown: undefined`, never absence. */
  readonly writeByProject: ReadonlyMap<
    string,
    ResolvedCallidescopeWriteConfiguration
  >;
}

/** Arguments for writing the destinations one project declared for itself. */
export interface SyncProjectSectionsArguments {
  readonly check: boolean;
  /** The depth and breadth limits each traced project is judged against. */
  readonly projectLimits: ProjectLimitsLookup;
  /** The findings for the one project these destinations belong to. */
  readonly report: ProjectReport;
  readonly result: CallGraphResult;
  /** Workspace-relative root every declared path is read against. */
  readonly root: string;
  readonly write: ResolvedCallidescopeWriteConfiguration;
}
