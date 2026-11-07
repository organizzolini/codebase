// 🏷️ Types

import type { TargetConfiguration } from "@nx/devkit";

/** Options accepted from this plugin's `nx.json` registration. */
export interface CoinageriePluginOptions {
  /** Name of the inferred per-project check target. */
  readonly checkTargetName: string;
  /** The command a check runs, to which `--check` is appended. */
  readonly command: string;
  /**
   * Extra cache inputs added to every inferred target, in Nx's own input
   * syntax — for example the glossary a configuration's `exclude.words` reads.
   */
  readonly inputs: readonly PluginInput[];
}

/** One cache input in Nx's own syntax: a string, or an object such as `{ env }`. */
export type PluginInput = NonNullable<TargetConfiguration["inputs"]>[number];
