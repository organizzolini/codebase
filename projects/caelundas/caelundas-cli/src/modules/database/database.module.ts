import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule as PersistenceDatabaseModule } from "@codebase/persistence";

import { DATABASE_ENTITIES, DATABASE_PROJECT } from "./database.constants";
import { DatabaseService } from "./database.service";

/**
 * Connects caelundas to the Postgres database its `CAELUNDAS_POSTGRES_*`
 * variables name, by default `caelundas_development`, in the `caelundas`
 * schema.
 *
 * The shared `PersistenceDatabaseModule.forRoot` reads those variables through
 * the
 * application's global `ConfigModule`. It never synchronizes the schema or
 * runs migrations on start: `nx run caelundas-cli:migration:run` does that.
 */
@Module({
  controllers: [],
  exports: [DatabaseService, TypeOrmModule],
  imports: [
    PersistenceDatabaseModule.forRoot({
      entities: DATABASE_ENTITIES,
      project: DATABASE_PROJECT,
    }),
    TypeOrmModule.forFeature(DATABASE_ENTITIES),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
