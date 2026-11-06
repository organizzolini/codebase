import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_MIGRATIONS,
  CAELUNDAS_DATABASE_PROJECT,
  DatabaseService,
} from "@codebase/caelundas-entities";
import { SqliteModule } from "@codebase/persistence";

/**
 * Connects caelundas to its SQLite file, by default `output/database.sqlite`
 * in this project, and migrates it on start: this is the one application that
 * writes the file, and a local file has one writer, so there is no second
 * process to race the DDL.
 *
 * It wires the library's pieces itself rather than calling
 * `DatabaseModule.forRoot({ migrate: true })` from `caelundas-entities`,
 * because Nest merges a dynamic module's imports with its decorator's, so
 * that call opens a second connection that never migrates beside the migrating one,
 * and an in-memory database would be two different databases.
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
