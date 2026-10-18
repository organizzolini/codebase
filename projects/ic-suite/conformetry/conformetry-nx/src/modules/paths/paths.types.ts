// 🏷️ Types

import type { Tree } from "@nx/devkit";

/** Where a generator's instances live, as the directories new ones may go. */
export interface AllowedDirectories {
  /**
   * Whether a destination outside `patterns` is refused. False when the
   * instances are literal paths, which name known projects rather than a rule.
   */
  readonly enforced: boolean;
  /** Workspace-relative globs, where `*` stands for one folder name. */
  readonly patterns: string[];
}

/** Arguments for deciding where a generator writes. */
export interface ResolveGenerationPathArguments {
  readonly configurationPath: string;
  /**
   * The generator being run, used to find the scope it is confined to.
   *
   * Optional so a caller with no generator in hand — anything resolving a path
   * outside a generator run — still gets the inferred layout.
   */
  readonly generatorName?: string | undefined;
  /** The generator's own inputs, such as `project`, `module`, and `name`. */
  readonly inputs: Record<string, string | undefined>;
  readonly tree: Tree;
  readonly workspaceRoot: string;
}
