// 🏷️ Types

import type { TargetConfiguration } from "@nx/devkit";

/** Options accepted from this plugin's `nx.json` registration. */
export interface CoinageriePluginOptions {
  /** Name of the inferred per-project check target. */
  readonly checkTargetName: string;
  /** The command a check runs, to which `batch` and its flags are appended. */
  readonly command: string;
  /**
   * Extra cache inputs added to every inferred target, in Nx's own input
   * syntax — for example the glossary a configuration's `exclude.words` reads.
   */
  readonly inputs: readonly PluginInput[];
  /**
   * Required. Where each project keeps its coinagerie configuration, relative
   * to the project's root: no search, no default.
   */
  readonly projectConfigurationPath: string;
}

/** One Nx cache input: a string or an object. */
export type PluginInput = NonNullable<TargetConfiguration["inputs"]>[number];
