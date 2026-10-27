import { mkdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { z } from "zod";

import { PROJECT_NAME_PATTERN } from "../postgresql/postgresql.constants";

import {
  SQLITE_CONNECTION_FIELDS,
  SQLITE_DATABASE_EXTENSION,
  SQLITE_ENVIRONMENT_SUFFIXES,
} from "./sqlite.constants";

import type {
  SqliteConnection,
  SqliteConnectionField,
  SqliteConnectionSource,
  SqliteDataSourceOptions,
  SqliteDataSourceSettings,
  SqliteEnvironmentShape,
  SqliteEnvironmentSource,
  SqliteOptions,
  SqliteProject,
  SqliteSettingsShape,
} from "./sqlite.types";

// 🌎 Utilities

/**
 * Holds `shape` to having a key for every one of `project`'s
 * `<PROJECT>_SQLITE_*` variables, which is what types
 * {@link sqliteEnvironmentSchema}'s computed keys from the project's name.
 * It checks the keys alone, never the schema under each, and throws, naming
 * each missing variable, when one is absent.
 */
export function assertSqliteEnvironmentKeys<Project extends string>(
  shape: Readonly<Record<string, z.ZodType>>,
  project: Project,
): asserts shape is SqliteEnvironmentShape<Project> {
  const missing: string[] = [];

  for (const key of sqliteEnvironmentKeys(project)) {
    if (!(key in shape)) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `The SQLite environment schema for '${project}' lacks ${missing.join(", ")}.`,
    );
  }
}

/**
 * The `DataSource` a project's TypeORM command-line entry exports, built from
 * the same options as `SqliteModule.forRoot` so a generated migration matches
 * what the application expects, and creates the database's folder if it is
 * missing. It reads only the project's
 * `<PROJECT>_SQLITE_*` variables, from `process.env` unless given others:
 *
 * ```ts
 * // src/modules/database/data-source.constants.ts
 * export const fixtureDataSource = createSqliteDataSource({
 *   entities: [Reading],
 *   migrations: ["src/modules/database/migrations/*.ts"],
 *   project: "fixture",
 * });
 * ```
 */
export function createSqliteDataSource(
  { project, ...settings }: SqliteOptions,
  environment: Readonly<Record<string, unknown>> = process.env,
): DataSource {
  const connection = sqliteConnection({ environment, project });
  ensureSqliteDirectory(connection);

  return new DataSource(sqliteDataSourceOptions(connection, settings));
}

/**
 * Creates the folder a file database lives in, which the driver will not:
 * `output/database.sqlite` needs `output/` first. A no-op for `:memory:` and
 * for a folder that exists, so it can run on every start.
 */
export function ensureSqliteDirectory({ database }: SqliteConnection): void {
  if (database !== ":memory:") {
    mkdirSync(path.dirname(path.resolve(database)), { recursive: true });
  }
}

/**
 * The connection a project's prefixed variables describe, defaulted the way
 * `sqliteEnvironmentSchema` defaults them.
 */
export function sqliteConnection({
  environment,
  project,
}: SqliteConnectionSource): SqliteConnection {
  const settings: Record<string, unknown> = {};

  for (const field of SQLITE_CONNECTION_FIELDS) {
    settings[field] = environment[sqliteEnvironmentKey(project, field)];
  }

  return sqliteSettingsSchema(project).parse(settings);
}

/**
 * The TypeORM options for `connection`, shared by the runtime module and the
 * command-line data source so a generated migration matches what the
 * application expects.
 *
 * `synchronize` and `migrationsRun` are hard-coded off here, as they are for
 * Postgres: the schema changes only through reviewed migrations. The module
 * alone turns `migrationsRun` on when it is given migrations. There is no
 * schema to name, so none is pinned. The driver is handed over rather than
 * left for TypeORM to `require` from its own location. TypeORM's driver enables
 * `PRAGMA foreign_keys` itself. Write-ahead logging stays off, so a finished
 * database is the one file rather than three. Snake case unless another
 * strategy is given, so a raw SQL reader never quotes a column.
 */
export function sqliteDataSourceOptions(
  connection: SqliteConnection,
  { entities, migrations, namingStrategy }: SqliteDataSourceSettings,
): SqliteDataSourceOptions {
  return {
    database: connection.database,
    driver: Database,
    entities,
    logging: false,
    migrations,
    migrationsRun: false,
    namingStrategy: namingStrategy ?? new SnakeNamingStrategy(),
    synchronize: false,
    type: "better-sqlite3",
  };
}

/**
 * `connection` as the project's `<PROJECT>_SQLITE_*` variables: what to stub
 * into the environment for a `SqliteModule` to read it back.
 */
export function sqliteEnvironment({
  connection,
  project,
}: SqliteEnvironmentSource): Record<string, string> {
  const environment: Record<string, string> = {};

  for (const field of SQLITE_CONNECTION_FIELDS) {
    environment[sqliteEnvironmentKey(project, field)] = connection[field];
  }

  return environment;
}

/**
 * The variable a project reads `field` from, for example
 * `CAELUNDAS_SQLITE_DATABASE` for caelundas's `database`. Throws when the
 * name could not prefix a variable or name a default file.
 */
export function sqliteEnvironmentKey(
  project: string,
  field: SqliteConnectionField,
): string {
  if (!PROJECT_NAME_PATTERN.test(project)) {
    throw new Error(
      `Project name '${project}' must match ${String(PROJECT_NAME_PATTERN)} to name its SQLite variable and default database file.`,
    );
  }

  return `${project.toUpperCase()}_${SQLITE_ENVIRONMENT_SUFFIXES[field]}`;
}

/** The `<PROJECT>_SQLITE_*` variable names a project reads. */
export function sqliteEnvironmentKeys(project: string): string[] {
  const keys: string[] = [];

  for (const field of SQLITE_CONNECTION_FIELDS) {
    keys.push(sqliteEnvironmentKey(project, field));
  }

  return keys;
}

/**
 * The zod fragment for a project's `<PROJECT>_SQLITE_*` variables, which each
 * application spreads into its own environment schema:
 *
 * ```ts
 * z.object({ ...sqliteEnvironmentSchema({ project: "caelundas" }), ... })
 * ```
 *
 * Its keys are typed from the project's name, which computed keys cannot
 * carry on their own, so {@link assertSqliteEnvironmentKeys} checks the one
 * key per connection field it builds.
 *
 * Throws when the name could not prefix a variable or name a default file.
 */
export function sqliteEnvironmentSchema<Project extends string>({
  project,
}: SqliteProject<Project>): SqliteEnvironmentShape<Project> {
  const settings = sqliteSettingsSchema(project).shape;
  const shape: Record<string, z.ZodType> = {};

  for (const field of SQLITE_CONNECTION_FIELDS) {
    shape[sqliteEnvironmentKey(project, field)] = settings[field];
  }

  assertSqliteEnvironmentKeys(shape, project);

  return shape;
}

/**
 * The project's connection fields, each defaulted from the project's name:
 * the database is `<project>.sqlite`, in the working directory.
 */
export function sqliteSettingsSchema(
  project: string,
): z.ZodObject<SqliteSettingsShape> {
  return z.object({
    database: z
      .string()
      .min(1)
      .default(`${project}${SQLITE_DATABASE_EXTENSION}`),
  });
}
