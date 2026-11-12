// 🏷️ Types

import type {
  LoadConfigurationArguments,
  LoadedCallidescopeConfiguration,
} from "./configuration.types";

/** File reads `ConfigurationService` needs. Narrow so tests can double them. */
export interface ConfigurationFileReader {
  findConfigurationFileAt(directory: string): string | undefined;
  loadConfigurationFile(
    args: LoadConfigurationArguments,
  ): Promise<LoadedCallidescopeConfiguration>;
}
