// ♟️ Constants

/**
 * The one variable every SQLite-backed project reads, named
 * `<PROJECT>_<SUFFIX>` and keyed by the connection field it fills. A file
 * database has no host, port, credentials, or schema, so the path is the
 * whole connection.
 */
export const SQLITE_ENVIRONMENT_SUFFIXES = {
  database: "SQLITE_DATABASE",
} as const;

/** Every connection field, in the order the variables are listed. */
export const SQLITE_CONNECTION_FIELDS = [
  "database",
] as const satisfies readonly (keyof typeof SQLITE_ENVIRONMENT_SUFFIXES)[];

/** The ending of a project's default database file, `<project>.sqlite`. */
export const SQLITE_DATABASE_EXTENSION = ".sqlite";

/**
 * Injects the options `SqliteModule.forRoot` was given into the
 * `SqliteService` that turns them into TypeORM's.
 */
export const SQLITE_OPTIONS = Symbol("SQLITE_OPTIONS");
