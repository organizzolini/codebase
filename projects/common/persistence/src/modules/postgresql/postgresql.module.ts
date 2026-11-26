import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DATABASE_OPTIONS } from "./postgresql.constants";
import { PostgresqlService } from "./postgresql.service";
import { openDataSource } from "./postgresql.utilities";

import type { PostgresqlModuleOptions } from "./postgresql.types";
import type { DynamicModule } from "@nestjs/common";

/**
 * Connects a project to its own Postgres database through TypeORM:
 *
 * ```ts
 * PostgresqlModule.forRoot({ entities: [Meander], project: "meanderaw" })
 * ```
 *
 * Reads the project's `<PROJECT>_POSTGRES_*` variables, so `ConfigModule` must
 * be global. Never synchronizes. Applies the pending migrations of
 * `options.migrations`, if given, under an advisory lock before the application
 * starts, so a project passing none runs none.
 */
@Module({
  controllers: [],
  exports: [PostgresqlService],
  imports: [],
  providers: [PostgresqlService],
})
export class PostgresqlModule {
  /** Connects the importing application as `options.project`. */
  static forRoot(options: PostgresqlModuleOptions): DynamicModule {
    const optionsProvider = { provide: DATABASE_OPTIONS, useValue: options };

    return {
      exports: [TypeOrmModule],
      imports: [
        TypeOrmModule.forRootAsync({
          dataSourceFactory: async (dataSourceOptions) => {
            if (dataSourceOptions === undefined) {
              throw new Error("TypeORM gave no options to open a data source.");
            }

            return openDataSource(dataSourceOptions);
          },
          extraProviders: [optionsProvider],
          useClass: PostgresqlService,
        }),
      ],
      module: PostgresqlModule,
      providers: [optionsProvider],
    };
  }
}
