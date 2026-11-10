// 🏷️ Types

import type { Instance } from "@conformetry/configuration";

/** Arguments for collecting the instances that belong to one project. */
export interface FindProjectInstancesArguments {
  readonly configurationPath: string;
  /**
   * Shared across one pass's projects, so a workspace-wide glob is expanded once.
   * Omit it and every call globs for itself.
   */
  readonly discoveryCache?: Map<string, Instance[]>;
  readonly project: ProjectScope;
  readonly workspaceRoot: string;
}

/** One Nx project, reduced to what instance scoping needs. */
export interface ProjectScope {
  readonly name: string;
  /** Project root, relative to the workspace root. */
  readonly root: string;
  readonly tags: string[];
}
