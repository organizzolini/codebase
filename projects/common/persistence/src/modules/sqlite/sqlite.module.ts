import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SQLITE_OPTIONS } from "./sqlite.constants";
import { SqliteService } from "./sqlite.service";

import type { SqliteModuleOptions } from "./sqlite.types";
import type { DynamicModule } from "@nestjs/common";

/**
 * Connects a project to its own SQLite file through TypeORM's better-sqlite3
 * driver, the way `PostgresqlModule` connects one to Postgres:
 *
 * ```ts
 * SqliteModule.forRoot({
 *   entities: [CalendarEvent],
 *   migrations: [CreateCalendarEvents1767225600000],
 *   project: "caelundas",
 * })
 * ```
 *
 * Reads the project's `<PROJECT>_SQLITE_DATABASE` variable through
 * `ConfigService`, so the application's `ConfigModule` must be global. Never
 * synchronizes; runs the migrations it is given on start. Each feature
 * module still registers its repositories with `TypeOrmModule.forFeature`.
 *
 * SQLite takes one writer at a time: keep a project's writes on this one
 * connection rather than opening the file a second time.
 */
@Module({
  controllers: [],
  exports: [SqliteService],
  imports: [],
  providers: [SqliteService],
})
export class SqliteModule {
  /** Connects the importing application as `options.project`. */
  static forRoot(options: SqliteModuleOptions): DynamicModule {
    const optionsProvider = { provide: SQLITE_OPTIONS, useValue: options };

    return {
      exports: [TypeOrmModule],
      imports: [
        TypeOrmModule.forRootAsync({
          extraProviders: [optionsProvider],
          useClass: SqliteService,
        }),
      ],
      module: SqliteModule,
      providers: [optionsProvider],
    };
  }
}
