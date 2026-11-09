// 🏷️ Types

import type {
  CodependixGraphType,
  CodependixProjectConfiguration,
  ResolvedCodependixConfiguration,
} from "@codependix/configuration";
import type { CodependixRunMode } from "@codependix/core";
import type { NxProject, NxProjectGraph } from "@codependix/nx-projects";

/**
 * Everything every graph-type pass reads, resolved once per run. The boundary gate reads it too.
 */
export interface GraphRunContext {
  /**
   * Projects every boundary graph is built over: the selection and its
   * dependencies. Wider than what is judged, so inherited findings become notes.
   */
  buildProjects: NxProject[];
  configuration: ResolvedCodependixConfiguration;
  /**
   * The graph types this run builds, checks, and writes, as narrowed by the
   * `--no-*` flags. Disabled passes are skipped before any graph is built.
   */
  enabledGraphTypes: ReadonlySet<CodependixGraphType>;
  graph: NxProjectGraph;
  mode: CodependixRunMode;
  /**
   * Each project's own `codependix.config.ts`, keyed by name; `undefined` if
   * it has none. Loaded once per run so every pass sees one snapshot.
   */
  projectConfigurations: Map<
    string,
    CodependixProjectConfiguration | undefined
  >;
  /** Every project the graph knows, apart from the workspace root. */
  projects: NxProject[];
  /**
   * Narrowed projects: judged by the boundary gate and drawn in the Workspace
   * Graph. Equals `projects` when neither flag is given.
   */
  selectedProjects: NxProject[];
  workingDirectory: string;
}

/**
 * The `--projects` patterns and `--tags` tags a run was given that matched
 * no project — see `RunContextService.findUnmatchedSelection`.
 */
export interface UnmatchedSelection {
  readonly projects: readonly string[];
  readonly tags: readonly string[];
}
