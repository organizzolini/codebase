// 🏷️ Types

import type { POSTGRES_ENVIRONMENT_SUFFIXES } from "./postgresql.constants";
import type { DataSourceOptions } from "typeorm";
import type { z } from "zod";

/** Backward-compatible alias for {@link PostgresqlModuleOptions}. */
export type DatabaseModuleOptions = PostgresqlModuleOptions;

/** Backward-compatible alias for {@link PostgresqlOptions}. */
export type DatabaseOptions = PostgresqlOptions;

/** A project's database location, login, and table schema. */
export interface PostgresConnection {
  readonly database: string;
  readonly host: string;
  readonly password: string;
  readonly port: number;
  readonly schema: string;
  readonly username: string;
}
/** A connection field one of the six variables fills. */
export type PostgresConnectionField =
  keyof typeof POSTGRES_ENVIRONMENT_SUFFIXES;

/** The variables a connection is read from, set or not. */
export interface PostgresConnectionSource extends PostgresProject {
  readonly environment: Readonly<Record<string, unknown>>;
}

/** TypeORM's options for a Postgres connection. */
export type PostgresDataSourceOptions = Extract<
  DataSourceOptions,
  { type: "postgres" }
>;

/** A project's code-supplied connection settings, not environment variables. */
export interface PostgresDataSourceSettings {
  readonly entities: NonNullable<PostgresDataSourceOptions["entities"]>;
  readonly migrations: NonNullable<PostgresDataSourceOptions["migrations"]>;
}

/** A project's own Postgres variable, for example `LEXICO_POSTGRES_DATABASE`. */
export type PostgresEnvironmentKey<Project extends string> =
  `${Uppercase<Project>}_${PostgresEnvironmentSuffix}`;

/** Field schemas keyed by variable name, for spreading into `z.object`. */
export type PostgresEnvironmentShape<Project extends string> = {
  readonly [
    Field in PostgresConnectionField as `${Uppercase<Project>}_${(typeof POSTGRES_ENVIRONMENT_SUFFIXES)[Field]}`
  ]: PostgresSettingsShape[Field];
};

/** A connection to render as the project's variables. */
export interface PostgresEnvironmentSource extends PostgresProject {
  readonly connection: PostgresConnection;
}

/** One of the six endings, for example `POSTGRES_DATABASE`. */
export type PostgresEnvironmentSuffix =
  (typeof POSTGRES_ENVIRONMENT_SUFFIXES)[PostgresConnectionField];

/** Names the project whose variables, database, schema, and role are meant. */
export interface PostgresProject<Project extends string = string> {
  readonly project: Project;
}

/** Project and connection part given to `PostgresqlModule.forRoot`, without migrations. */
export interface PostgresqlModuleOptions
  extends Omit<PostgresDataSourceSettings, "migrations">, PostgresProject {}

/** Module options, plus the migrations the TypeORM CLI runs. */
export interface PostgresqlOptions
  extends PostgresDataSourceSettings, PostgresqlModuleOptions {}

/** The zod schema each connection field is validated by. */
export type PostgresSettingsShape = Readonly<
  Record<"port", z.ZodDefault<z.ZodCoercedNumber>> &
    Record<Exclude<PostgresConnectionField, "port">, z.ZodDefault<z.ZodString>>
>;
