// 🏷️ Types

/** One migration and its paired SQL output file paths. */
export interface MigrationSqlPaths {
  readonly downPath: string;
  readonly migrationPath: string;
  readonly upPath: string;
}

/** SQL extracted from one TypeORM migration class. */
export interface MigrationSqlStatements {
  down: string[];
  up: string[];
}

/** Parsed migration options from one project.json file. */
export interface TypeormMigrationParsedProjectTarget {
  readonly modulePath: string;
  readonly projectName: string;
  readonly projectRoot: string;
}

/** One project.json entry with a migration module directory to process. */
export interface TypeormMigrationProjectTarget {
  readonly migrationsDirectory: string;
  readonly projectName: string;
}

/** Which migrations to process when one migration file was not named. */
export type TypeormMigrationSelection = "all" | "latest";

/** Options parsed from the command line for TypeORM migration SQL sync. */
export interface TypeormMigrationSqlCommandOptions {
  directory?: string;
  migration?: string;
  module?: string;
  project?: string;
  projectRoot?: string;
  selection?: TypeormMigrationSelection;
}
