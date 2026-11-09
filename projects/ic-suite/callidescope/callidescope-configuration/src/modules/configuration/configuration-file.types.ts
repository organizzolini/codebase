// 🏷️ Types

import type {
  LoadConfigurationArguments,
  LoadedCallidescopeConfiguration,
} from "./configuration.types";

/**
 * The two file reads the collaborators behind `ConfigurationService` need.
 * Narrow so a double can replace the layer.
 */
export interface ConfigurationFileReader {
  findConfigurationFileAt(directory: string): string | undefined;
  loadConfigurationFile(
    args: LoadConfigurationArguments,
  ): Promise<LoadedCallidescopeConfiguration>;
}
