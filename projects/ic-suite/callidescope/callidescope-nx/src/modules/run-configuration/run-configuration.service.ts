import { ConfigurationService } from "@callidescope/configuration";
import { Injectable } from "@nestjs/common";

import type {
  LoadedRunConfiguration,
  LoadRunConfigurationArguments,
} from "./run-configuration.types";

/**
 * Reads the callidescope configuration one run is judged by.
 *
 * Its own service rather than more of `PluginService`, because every target
 * here starts by reading the same file — the one its `configurationPath` names
 * — and none of them can be written until it is read. Keeping
 * it apart also keeps the verdict and the inference in `PluginService` beside
 * each other, which is where the rules a reader comes looking for are.
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
   * Resolves and loads the configuration one run is judged by.
   *
   * The file-aware load rather than the plain one: a run resolves a
   * configuration beside every project it reaches, and skips whichever file is
   * already serving as this run's own.
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
