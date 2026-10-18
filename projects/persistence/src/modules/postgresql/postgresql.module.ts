import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DATABASE_OPTIONS } from "./postgresql.constants";
import { PostgresqlService } from "./postgresql.service";

import type { DatabaseModuleOptions } from "./postgresql.types";
import type { DynamicModule } from "@nestjs/common";

/**
 * Connects a project to its own Postgres database through TypeORM, the one
 * way every database-backed project does:
 *
 * ```ts
 * PostgresqlModule.forRoot({
 *   entities: [Meander],
 *   project: "meanderaw",
 * })
 * ```
 *
 * Reads the project's `<PROJECT>_POSTGRES_*` variables through
 * `ConfigService`, so the application's `ConfigModule` must be global. Never
 * synchronizes and never runs migrations, so it takes none: they run on
 * their own, through the command-line data source. Each feature module
 * still registers its repositories with `TypeOrmModule.forFeature`.
 */
@Module({
  controllers: [],
  exports: [PostgresqlService],
  imports: [],
  providers: [PostgresqlService],
})
export class PostgresqlModule {
  /** Connects the importing application as `options.project`. */
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    const optionsProvider = { provide: DATABASE_OPTIONS, useValue: options };

    return {
      exports: [TypeOrmModule],
      imports: [
        TypeOrmModule.forRootAsync({
          extraProviders: [optionsProvider],
          useClass: PostgresqlService,
        }),
      ],
      module: PostgresqlModule,
      providers: [optionsProvider],
    };
  }
}
