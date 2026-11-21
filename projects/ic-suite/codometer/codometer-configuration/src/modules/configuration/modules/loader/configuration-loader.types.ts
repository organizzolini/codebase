// 🏷️ Types

/** What `ConfigurationLoaderService.load` found, unvalidated. */
export interface LoadedConfigurationModule {
  configuration: unknown;
  /**
   * Absolute path of the file it came from.
   *
   * Carried because a resolved configuration no longer says which file it came from.
   */
  path: string;
}
