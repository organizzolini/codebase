import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SqliteModule } from "@codebase/persistence";

import { DATABASE_ENTITIES, DATABASE_PROJECT } from "./database.constants";
import { DatabaseService } from "./database.service";
import { Migration1793045891250 } from "./migrations/1793045891250-migration";

/**
 * Connects caelundas to the SQLite file its `CAELUNDAS_SQLITE_DATABASE`
 * variable names, by default `output/database.sqlite` in the
 * `caelundas-cli` project.
 *
 * `SqliteModule.forRoot` reads that variable through the application's
 * global `ConfigModule`. It never synchronizes the schema, but it runs the
 * initial migration on start, so a run creates the file and its tables when
 * they are missing: a local file has one writer, so there is no second
 * process to race the DDL.
 */
@Module({
  controllers: [],
  exports: [DatabaseService, TypeOrmModule],
  imports: [
    SqliteModule.forRoot({
      entities: DATABASE_ENTITIES,
      migrations: [Migration1793045891250],
      project: DATABASE_PROJECT,
    }),
    TypeOrmModule.forFeature(DATABASE_ENTITIES),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
