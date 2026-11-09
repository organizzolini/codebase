import pluralize from "pluralize";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

// ♟️ Constants

/**
 * The six variables every project reads, named `<PROJECT>_<SUFFIX>`. The
 * prefix keeps the root's admin `POSTGRES_*` login, loaded into every task,
 * out of applications.
 */
export const POSTGRES_ENVIRONMENT_SUFFIXES = {
  database: "POSTGRES_DATABASE",
  host: "POSTGRES_HOST",
  password: "POSTGRES_PASSWORD",
  port: "POSTGRES_PORT",
  schema: "POSTGRES_SCHEMA",
  username: "POSTGRES_USERNAME",
} as const;

/** Every connection field, in the order the variables are listed. */
export const POSTGRES_CONNECTION_FIELDS = [
  "database",
  "host",
  "password",
  "port",
  "schema",
  "username",
] as const satisfies readonly (keyof typeof POSTGRES_ENVIRONMENT_SUFFIXES)[];

/** Where the shared local Docker Postgres listens. */
export const DEFAULT_POSTGRES_HOST = "localhost";

/** The port the shared local Docker Postgres publishes. */
export const DEFAULT_POSTGRES_PORT = 5432;

/**
 * Project names: lowercase letters, digits, and underscores, starting with a
 * letter, so they need no quoting in SQL or environment names.
 */
export const PROJECT_NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

/**
 * Injects the options `PostgresqlModule.forRoot` was given into the
 * `PostgresqlService` that turns them into TypeORM's.
 */
export const DATABASE_OPTIONS = Symbol("DATABASE_OPTIONS");

/**
 * Shared by every Postgres project: snake case, plural names, and join tables
 * named from both, sorted, so either side declares the same name.
 */
export const PluralSnakeNamingStrategy: new () => SnakeNamingStrategy = class extends SnakeNamingStrategy {
  /** Builds a deterministic join table name from both entity table names. */
  override joinTableName(
    firstEntityName: string,
    secondEntityName: string,
  ): string {
    const firstTableName = super.tableName(firstEntityName, firstEntityName);
    const secondTableName = super.tableName(secondEntityName, secondEntityName);

    return [pluralize(firstTableName), pluralize(secondTableName)]
      .toSorted()
      .join("_");
  }

  /** Converts a base table name to the plural table name used in the schema. */
  override tableName(targetName: string, userSpecifiedName: string): string {
    return pluralize(super.tableName(targetName, userSpecifiedName));
  }
};
