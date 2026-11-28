import { Inject, Injectable, Optional } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { DATABASE_OPTIONS, MigrationFailedError } from "./postgresql.constants";
import {
  postgresConnection,
  postgresDataSourceOptions,
  postgresEnvironmentKeys,
} from "./postgresql.utilities";

import type {
  PostgresConnection,
  PostgresqlModuleOptions,
} from "./postgresql.types";
import type {
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from "@nestjs/typeorm";

/**
 * Turns the options `PostgresqlModule.forRoot` was given, and the project's
 * `<PROJECT>_POSTGRES_*` variables read through `ConfigService`, into
 * TypeORM's options: the factory `TypeOrmModule.forRootAsync` is handed.
 *
 * Unprefixed `POSTGRES_*` variables are never read, so the root's admin
 * login, which Nx loads into every task, cannot reach an application.
 */
@Injectable()
export class PostgresqlService implements TypeOrmOptionsFactory {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigService,
    @Inject(DATABASE_OPTIONS)
    @Optional()
    private readonly options?: PostgresqlModuleOptions,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The options `forRoot` provides. Optional only so the bare module still
   * boots; using it without them throws.
   */
  private databaseOptions(): PostgresqlModuleOptions {
    if (this.options === undefined) {
      throw new Error(
        "PostgresqlService has no options: import PostgresqlModule.forRoot({ project, entities }) rather than PostgresqlModule.",
      );
    }

    return this.options;
  }

  // 🌎 Public Methods

  /** Where the project's database is, read from its prefixed variables and defaulted from its name. */
  connection(): PostgresConnection {
    const { project } = this.databaseOptions();

    return postgresConnection({
      environment: Object.fromEntries(
        postgresEnvironmentKeys(project).map((key) => [
          key,
          this.configurationService.get<unknown>(key),
        ]),
      ),
      project,
    });
  }

  /** TypeORM's options for the project's connection, with the migrations it was given, if any. */
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const options = this.databaseOptions();

    return {
      ...postgresDataSourceOptions(this.connection(), {
        ...options,
        migrations: options.migrations ?? [],
      }),
      // Connection errors are retried while Postgres starts; a failed migration is not.
      toRetry: (error: unknown) => !(error instanceof MigrationFailedError),
    };
  }
}
