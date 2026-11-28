import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule as PersistenceDatabaseModule } from "@codebase/persistence";

import {
  CAELUNDAS_DATABASE_MIGRATIONS,
  DATABASE_ENTITIES,
} from "./data-source.constants";
import { DATABASE_PROJECT } from "./database.constants";
import { DatabaseService } from "./database.service";

/**
 * Connects an application to the `caelundas` schema as `caelundas_username`
 * through the shared `DatabaseModule.forRoot`, with every entity registered.
 * Never synchronizes; applies pending migrations at start under an advisory
 * lock (`nx run caelundas-db:migration:run` does so by hand). Reads
 * `CAELUNDAS_POSTGRES_*`, so `ConfigModule` must be global.
 */
@Module({
  controllers: [],
  exports: [DatabaseService, TypeOrmModule],
  imports: [
    PersistenceDatabaseModule.forRoot({
      entities: [...DATABASE_ENTITIES],
      migrations: [...CAELUNDAS_DATABASE_MIGRATIONS],
      project: DATABASE_PROJECT,
    }),
    TypeOrmModule.forFeature([...DATABASE_ENTITIES]),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
