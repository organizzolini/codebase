// 🏷️ Types

import type { SQLITE_ENVIRONMENT_SUFFIXES } from "./sqlite.constants";
import type { DataSourceOptions, NamingStrategyInterface } from "typeorm";
import type { z } from "zod";

/** Where a project's database file is: a path, or `:memory:`. */
export interface SqliteConnection {
  readonly database: string;
}

/** A connection field a variable fills. */
export type SqliteConnectionField = keyof typeof SQLITE_ENVIRONMENT_SUFFIXES;

/** The variables a connection is read from, set or not. */
export interface SqliteConnectionSource extends SqliteProject {
  readonly environment: Readonly<Record<string, unknown>>;
}

/** TypeORM's options for a better-sqlite3 connection. */
export type SqliteDataSourceOptions = Extract<
  DataSourceOptions,
  { type: "better-sqlite3" }
>;

/** What a project's code contributes to its connection: everything that is not an environment variable. */
export interface SqliteDataSourceSettings {
  readonly entities: NonNullable<SqliteDataSourceOptions["entities"]>;
  readonly migrations: NonNullable<SqliteDataSourceOptions["migrations"]>;

  /** Replaces snake case, as lexico's pluralizing strategy does. */
  readonly namingStrategy?: NamingStrategyInterface;
}

/** A project's own SQLite variable, for example `CAELUNDAS_SQLITE_DATABASE`. */
export type SqliteEnvironmentKey<Project extends string> =
  `${Uppercase<Project>}_${SqliteEnvironmentSuffix}`;

/**
 * The fragment `sqliteEnvironmentSchema` returns: every field's schema,
 * keyed by the project's own variable name, ready to spread into
 * `z.object({ ... })`.
 */
export type SqliteEnvironmentShape<Project extends string> = {
  readonly [
    Field in SqliteConnectionField as `${Uppercase<Project>}_${(typeof SQLITE_ENVIRONMENT_SUFFIXES)[Field]}`
  ]: SqliteSettingsShape[Field];
};

/** A connection to render as the project's variables. */
export interface SqliteEnvironmentSource extends SqliteProject {
  readonly connection: SqliteConnection;
}

/** The ending of the variable, `SQLITE_DATABASE`. */
export type SqliteEnvironmentSuffix =
  (typeof SQLITE_ENVIRONMENT_SUFFIXES)[SqliteConnectionField];

/**
 * What `SqliteModule.forRoot` is given: the project, and its code's part of
 * the connection. Migrations are optional, and run on start when given: a
 * single local file has no second process to race the DDL.
 */
export interface SqliteModuleOptions
  extends Omit<SqliteDataSourceSettings, "migrations">, SqliteProject {
  readonly migrations?: SqliteDataSourceSettings["migrations"];
}

/** What `createSqliteDataSource` is given: the project and the migrations the TypeORM command line runs. */
export interface SqliteOptions
  extends SqliteDataSourceSettings, SqliteProject {}

/** Names the project whose variables and default database file are meant. */
export interface SqliteProject<Project extends string = string> {
  readonly project: Project;
}

/** The zod schema each connection field is validated by. */
export type SqliteSettingsShape = Readonly<
  Record<SqliteConnectionField, z.ZodDefault<z.ZodString>>
>;
