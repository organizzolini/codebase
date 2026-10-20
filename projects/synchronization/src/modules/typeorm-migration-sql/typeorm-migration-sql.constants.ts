// ♟️ Constants

/** TypeORM migration file names this command processes by default. */
export const TYPEORM_MIGRATION_FILE_PATTERN = /^\d{13}-\w.*\.ts$/;

/** What the command says when required location options are missing. */
export const TYPEORM_MIGRATION_SQL_OPTION_MESSAGES = {
  location:
    "Pass --directory <path>, or pass both --project-root <path> and --module <path>, or pass --project <name>.",
} as const;

/** A TypeORM migration SQL synchronization command line that cannot run. */
export class TypeormMigrationSqlOptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = TypeormMigrationSqlOptionsError.name;
  }
}
