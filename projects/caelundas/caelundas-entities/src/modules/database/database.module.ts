import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SqliteModule } from "@codebase/persistence";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_MIGRATIONS,
  CAELUNDAS_DATABASE_PROJECT,
} from "./database.constants";
import { DatabaseService } from "./database.service";

import type { DatabaseModuleOptions } from "./database.types";
import type { DynamicModule } from "@nestjs/common";

/**
 * Connects an application to the SQLite file its `CAELUNDAS_SQLITE_DATABASE`
 * variable names, with every caelundas entity registered. The variable is
 * read through the application's global `ConfigModule`, and the schema is
 * never synchronized.
 *
 * Imported as it is, the module only opens the file, which is what an
 * application that reads it needs. The one application that writes it uses
 * `forRoot({ migrate: true })`, so a run creates the file and its tables when
 * they are missing: a local file has one writer, so there is no second
 * process to race the DDL.
 */
@Module({
  controllers: [],
  exports: [DatabaseService, TypeOrmModule],
  imports: [
    SqliteModule.forRoot({
      entities: CAELUNDAS_DATABASE_ENTITIES,
      project: CAELUNDAS_DATABASE_PROJECT,
    }),
    TypeOrmModule.forFeature(CAELUNDAS_DATABASE_ENTITIES),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {
  /** Connects the importing application, running the migration on start when asked to. */
  static forRoot({ migrate }: DatabaseModuleOptions): DynamicModule {
    return {
      exports: [DatabaseService, TypeOrmModule],
      imports: [
        SqliteModule.forRoot({
          entities: CAELUNDAS_DATABASE_ENTITIES,
          project: CAELUNDAS_DATABASE_PROJECT,
          ...(migrate ? { migrations: CAELUNDAS_DATABASE_MIGRATIONS } : {}),
        }),
        TypeOrmModule.forFeature(CAELUNDAS_DATABASE_ENTITIES),
      ],
      module: DatabaseModule,
      providers: [DatabaseService],
    };
  }
}
