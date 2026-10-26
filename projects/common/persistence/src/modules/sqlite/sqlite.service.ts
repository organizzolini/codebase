import { Inject, Injectable, Optional } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { SQLITE_OPTIONS } from "./sqlite.constants";
import {
  sqliteConnection,
  sqliteDataSourceOptions,
  sqliteEnvironmentKeys,
} from "./sqlite.utilities";

import type {
  SqliteConnection,
  SqliteDataSourceOptions,
  SqliteModuleOptions,
} from "./sqlite.types";
import type { TypeOrmOptionsFactory } from "@nestjs/typeorm";

/**
 * Turns the options `SqliteModule.forRoot` was given, and the project's
 * `<PROJECT>_SQLITE_*` variables read through `ConfigService`, into TypeORM's
 * options: the factory `TypeOrmModule.forRootAsync` is handed.
 */
@Injectable()
export class SqliteService implements TypeOrmOptionsFactory {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigService,
    @Inject(SQLITE_OPTIONS)
    @Optional()
    private readonly options?: SqliteModuleOptions,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The options `SqliteModule.forRoot` provides. Optional only so the bare
   * module still boots for a dependency graph; using it without them is a
   * mistake this names.
   */
  private sqliteOptions(): SqliteModuleOptions {
    if (this.options === undefined) {
      throw new Error(
        "SqliteService has no options: import SqliteModule.forRoot({ project, entities }) rather than SqliteModule.",
      );
    }

    return this.options;
  }

  // 🌎 Public Methods

  /** Where the project's database file is, read from its prefixed variable and defaulted from its name. */
  connection(): SqliteConnection {
    const { project } = this.sqliteOptions();

    return sqliteConnection({
      environment: Object.fromEntries(
        sqliteEnvironmentKeys(project).map((key) => [
          key,
          this.configurationService.get<unknown>(key),
        ]),
      ),
      project,
    });
  }

  /**
   * TypeORM's options for the project's connection. Migrations run on start
   * when the module was given any, which Postgres never does: a local file
   * has one writer, so there is no second process to race the DDL.
   */
  createTypeOrmOptions(): SqliteDataSourceOptions {
    const { migrations = [], ...settings } = this.sqliteOptions();

    return {
      ...sqliteDataSourceOptions(this.connection(), {
        ...settings,
        migrations,
      }),
      migrationsRun: Object.keys(migrations).length > 0,
    };
  }
}
