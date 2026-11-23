// ♟️ Constants

/** TypeORM migration file names this command processes by default. */
export const TYPEORM_MIGRATION_FILE_PATTERN = /^\d{13}-\w.*\.ts$/;

/** The folder at a project's root that holds its migrations. */
export const MIGRATIONS_FOLDER = "migrations";

/** A single-quoted SQL literal, including any `''` escapes. */
export const SINGLE_QUOTED_LITERAL = /('(?:[^']|'')*')/u;
