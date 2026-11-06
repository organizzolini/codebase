import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_MIGRATIONS,
  CAELUNDAS_DATABASE_PROJECT,
} from "@codebase/caelundas-entities";
import { SqliteModule } from "@codebase/persistence";

import { DatabaseService } from "./database.service";

/**
 * Connects caelundas to the SQLite file its `CAELUNDAS_SQLITE_DATABASE`
 * variable names, by default `output/database.sqlite` in the
 * `caelundas-cli` project.
 *
 * `SqliteModule.forRoot` reads that variable through the application's
 * global `ConfigModule`. It never synchronizes the schema, but it runs the
 * migrations on start, so a run creates the file and its tables when
 * they are missing: a local file has one writer, so there is no second
 * process to race the DDL.
 */
@Module({
  controllers: [],
  exports: [DatabaseService, TypeOrmModule],
  imports: [
    SqliteModule.forRoot({
      entities: CAELUNDAS_DATABASE_ENTITIES,
      migrations: CAELUNDAS_DATABASE_MIGRATIONS,
      project: CAELUNDAS_DATABASE_PROJECT,
    }),
    TypeOrmModule.forFeature(CAELUNDAS_DATABASE_ENTITIES),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
