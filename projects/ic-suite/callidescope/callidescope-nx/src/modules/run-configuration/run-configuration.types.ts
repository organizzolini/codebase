// 🏷️ Types

import type { ResolvedCallidescopeConfiguration } from "@callidescope/configuration";

/** A loaded configuration, beside the path the loader settled on. */
export interface LoadedRunConfiguration {
  readonly configuration: ResolvedCallidescopeConfiguration;
  /** Where the configuration was read from: the path the loader settled on, since a relative one is resolved before reading. */
  readonly path: string;
}

/** Arguments for loading the configuration one run is judged by. */
export interface LoadRunConfigurationArguments {
  /** The workspace configuration file, as this plugin's registration names it. */
  readonly configurationPath: string;
  readonly workspaceRoot: string;
}
