// 🏷️ Types

import type {
  LoadConfigurationArguments,
  LoadedCallidescopeConfiguration,
} from "./configuration.types";

/** File reads `ConfigurationService` needs. Narrow so tests can double them. */
export interface ConfigurationFileReader {
  configurationFileExists(filePath: string): boolean;
  loadConfigurationFile(
    args: LoadConfigurationArguments,
  ): Promise<LoadedCallidescopeConfiguration>;
}
