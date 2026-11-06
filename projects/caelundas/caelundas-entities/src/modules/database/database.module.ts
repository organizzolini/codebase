import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SqliteModule } from "@codebase/persistence";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_PROJECT,
} from "./database.constants";
import { DatabaseService } from "./database.service";

/**
 * Connects an application to the SQLite file its `CAELUNDAS_SQLITE_DATABASE`
 * variable names, with every caelundas entity registered. The variable is
 * read through the application's global `ConfigModule`, and the schema is
 * never synchronized.
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
export class DatabaseModule {}
