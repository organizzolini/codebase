import { DataSource } from "typeorm";
import { z } from "zod";

import {
  DEFAULT_POSTGRES_HOST,
  DEFAULT_POSTGRES_PORT,
  PluralSnakeNamingStrategy,
  POSTGRES_CONNECTION_FIELDS,
  POSTGRES_ENVIRONMENT_SUFFIXES,
  PROJECT_NAME_PATTERN,
} from "./postgresql.constants";

import type {
  PostgresConnection,
  PostgresConnectionField,
  PostgresConnectionSource,
  PostgresDataSourceOptions,
  PostgresDataSourceSettings,
  PostgresEnvironmentShape,
  PostgresEnvironmentSource,
  PostgresProject,
  PostgresqlOptions,
  PostgresSettingsShape,
} from "./postgresql.types";

// 🌎 Utilities

/**
 * Throws, naming each missing variable, unless `shape` has a key for every
 * `<PROJECT>_POSTGRES_*` variable. Types {@link postgresEnvironmentSchema}'s keys.
 */
export function assertPostgresEnvironmentKeys<Project extends string>(
  shape: Readonly<Record<string, z.ZodType>>,
  project: Project,
): asserts shape is PostgresEnvironmentShape<Project> {
  const missing: string[] = [];

  for (const key of postgresEnvironmentKeys(project)) {
    if (!(key in shape)) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `The Postgres environment schema for '${project}' lacks ${missing.join(", ")}.`,
    );
  }
}

/**
 * The `DataSource` a project's TypeORM command-line entry exports, built from
 * the same options as `PostgresqlModule.forRoot`. Reads only the project's
 * `<PROJECT>_POSTGRES_*` variables.
 */
export function createDataSource(
  { project, ...settings }: PostgresqlOptions,
  environment: Readonly<Record<string, unknown>> = process.env,
): DataSource {
  return new DataSource(
    postgresDataSourceOptions(
      postgresConnection({ environment, project }),
      settings,
    ),
  );
}

/**
 * The connection a project's prefixed variables describe, defaulted the way
 * `postgresEnvironmentSchema` defaults them. Unprefixed variables are never
 * read.
 */
export function postgresConnection({
  environment,
  project,
}: PostgresConnectionSource): PostgresConnection {
  const settings: Record<string, unknown> = {};

  for (const field of POSTGRES_CONNECTION_FIELDS) {
    settings[field] = environment[postgresEnvironmentKey(project, field)];
  }

  return postgresSettingsSchema(project).parse(settings);
}

/**
 * The TypeORM options for `connection`, shared by runtime and command-line
 * data sources. Schema changes only via reviewed migrations, so `synchronize`
 * is off.
 */
export function postgresDataSourceOptions(
  connection: PostgresConnection,
  { entities, migrations }: PostgresDataSourceSettings,
): PostgresDataSourceOptions {
  return {
    database: connection.database,
    entities,
    extra: { options: postgresSearchPathOption(connection.schema) },
    host: connection.host,
    logging: false,
    migrations,
    migrationsRun: false,
    namingStrategy: new PluralSnakeNamingStrategy(),
    password: connection.password,
    port: connection.port,
    schema: connection.schema,
    synchronize: false,
    type: "postgres",
    username: connection.username,
  };
}

/**
 * `connection` as the project's `<PROJECT>_POSTGRES_*` variables: what to
 * stub into the environment for a `PostgresqlModule` to read it back.
 */
export function postgresEnvironment({
  connection,
  project,
}: PostgresEnvironmentSource): Record<string, string> {
  const environment: Record<string, string> = {};

  for (const field of POSTGRES_CONNECTION_FIELDS) {
    environment[postgresEnvironmentKey(project, field)] = String(
      connection[field],
    );
  }

  return environment;
}

/**
 * The variable a project reads `field` from, such as `LEXICO_POSTGRES_DATABASE`.
 * Throws when the name cannot prefix a variable unquoted.
 */
export function postgresEnvironmentKey(
  project: string,
  field: PostgresConnectionField,
): string {
  if (!PROJECT_NAME_PATTERN.test(project)) {
    throw new Error(
      `Project name '${project}' must match ${String(PROJECT_NAME_PATTERN)} to name its Postgres variables, database, schema, and role.`,
    );
  }

  return `${project.toUpperCase()}_${POSTGRES_ENVIRONMENT_SUFFIXES[field]}`;
}

/** The `<PROJECT>_POSTGRES_*` variable names a project reads. */
export function postgresEnvironmentKeys(project: string): string[] {
  const keys: string[] = [];

  for (const field of POSTGRES_CONNECTION_FIELDS) {
    keys.push(postgresEnvironmentKey(project, field));
  }

  return keys;
}

/**
 * The zod fragment for a project's `<PROJECT>_POSTGRES_*` variables, which each
 * application spreads into its own environment schema.
 */
export function postgresEnvironmentSchema<Project extends string>({
  project,
}: PostgresProject<Project>): PostgresEnvironmentShape<Project> {
  const settings = postgresSettingsSchema(project).shape;
  const shape: Record<string, z.ZodType> = {};

  for (const field of POSTGRES_CONNECTION_FIELDS) {
    shape[postgresEnvironmentKey(project, field)] = settings[field];
  }

  assertPostgresEnvironmentKeys(shape, project);

  return shape;
}

/**
 * The startup parameter setting the session's `search_path` to `schema` alone.
 * `public` is left off, so unqualified DDL fails.
 */
export function postgresSearchPathOption(schema: string): string {
  if (!PROJECT_NAME_PATTERN.test(schema)) {
    throw new Error(
      `Schema '${schema}' must match ${String(PROJECT_NAME_PATTERN)} to be set as the search path unquoted.`,
    );
  }

  return `-c search_path=${schema}`;
}

/**
 * Connection fields defaulted from the project's name: database
 * `<project>_development`, schema `<project>`, role `<project>_username`. A set
 * schema must match the name pattern.
 */
export function postgresSettingsSchema(
  project: string,
): z.ZodObject<PostgresSettingsShape> {
  return z.object({
    database: z.string().min(1).default(`${project}_development`),
    host: z.string().min(1).default(DEFAULT_POSTGRES_HOST),
    password: z.string().default(`${project}_password`),
    port: z.coerce.number().int().positive().default(DEFAULT_POSTGRES_PORT),
    schema: z.string().regex(PROJECT_NAME_PATTERN).default(project),
    username: z.string().min(1).default(`${project}_username`),
  });
}
