// 🏷️ Types

import type { ResolvedCallidescopeConfiguration } from "@callidescope/configuration";

/** A loaded configuration, beside the path the loader settled on. */
export interface LoadedRunConfiguration {
  readonly configuration: ResolvedCallidescopeConfiguration;
  /**
   * Where the configuration was read from.
   *
   * The path the loader settled on rather than the one it was handed, since a
   * relative path is resolved before it is read — and a run resolves a
   * project's own configuration relative to it.
   */
  readonly path: string;
}

/** Arguments for loading the configuration one run is judged by. */
export interface LoadRunConfigurationArguments {
  /** The workspace configuration file, as this plugin's registration names it. */
  readonly configurationPath: string;
  readonly workspaceRoot: string;
}
