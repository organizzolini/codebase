// 🏷️ Types

/** What `DatabaseModule.forRoot` is given. */
export interface DatabaseModuleOptions {
  /** Whether to run the migration on start, creating the tables when missing. */
  readonly migrate: boolean;
}
