// 🏷️ Types

import type { TargetConfiguration } from "@nx/devkit";

/** Options accepted from this plugin's `nx.json` registration. */
export interface CodometerPluginOptions {
  /** The shell command that starts codometer, before `measure`. */
  readonly command: string;
  /** Extra cache inputs for every inferred target, in Nx's syntax. */
  readonly inputs: readonly PluginInput[];
  /**
   * Where a project keeps the configuration its limit run reads, relative to
   * its root, when that differs from its main one. A project without the file
   * uses `projectConfigurationPath`.
   */
  readonly limitConfigurationPath?: string | undefined;
  /** Name of the inferred per-project source-only limit target. */
  readonly limitTargetName: string;
  /** Required. Each project's configuration path, relative to its root. */
  readonly projectConfigurationPath: string;
  /** Name of the inferred per-project packaged-size target. */
  readonly weighTargetName: string;
}

/** One Nx cache input: a string or an object. */
export type PluginInput = NonNullable<TargetConfiguration["inputs"]>[number];
