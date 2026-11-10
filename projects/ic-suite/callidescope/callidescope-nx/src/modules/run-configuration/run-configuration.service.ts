import { ConfigurationService } from "@callidescope/configuration";
import { Injectable } from "@nestjs/common";

import type {
  LoadedRunConfiguration,
  LoadRunConfigurationArguments,
} from "./run-configuration.types";

/**
 * Reads the callidescope configuration one run is judged by.
 *
 * Kept apart from `PluginService` because every target reads this file first. Keeping it
 * separate leaves the verdict and inference together in `PluginService`.
 */
@Injectable()
export class RunConfigurationService {
  // 🏗 Dependency Injection

  constructor(private readonly configurationService: ConfigurationService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Resolves and loads the configuration one run is judged by, skipping whichever file is already
   * this run's own.
   */
  public async load(
    args: LoadRunConfigurationArguments,
  ): Promise<LoadedRunConfiguration> {
    const loaded = await this.configurationService.loadConfigurationFile({
      configurationPath: args.configurationPath,
    });

    return { configuration: loaded.configuration, path: loaded.path };
  }
}
