import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DATABASE_OPTIONS } from "./postgresql.constants";
import { PostgresqlService } from "./postgresql.service";

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
 * be global. Never synchronizes or runs migrations; those run through the data
 * source.
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
          extraProviders: [optionsProvider],
          useClass: PostgresqlService,
        }),
      ],
      module: PostgresqlModule,
      providers: [optionsProvider],
    };
  }
}
