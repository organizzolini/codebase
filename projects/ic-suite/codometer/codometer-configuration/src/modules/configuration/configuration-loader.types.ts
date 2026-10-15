// 🏷️ Types

/** What `ConfigurationLoaderService.load` found, unvalidated. */
export interface LoadedConfigurationModule {
  configuration: unknown;
  /**
   * Absolute path of the file it came from.
   *
   * Carried because a caller listing what a repository configures has to say
   * where each answer was written: by the time a configuration is resolved, the
   * file it came from is no longer recoverable from the result.
   */
  path: string;
}
