import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule as PersistenceDatabaseModule } from "@codebase/persistence";

import { CaelundasDatabaseService } from "./caelundas-database.service";
import { CAELUNDAS_DATABASE_ENTITIES } from "./data-source.constants";

/**
 * Connects an application to `caelundas_development`.`caelundas` as `caelundas_username`, through the shared `DatabaseModule.forRoot` and its naming strategy, with every caelundas entity registered. Never synchronizes or runs migrations on start: `nx run caelundas-db:migration:run` does that.
 *
 * Reads `CAELUNDAS_POSTGRES_*` via `ConfigService`, so the importing app's `ConfigModule` must be global.
 */
@Module({
  controllers: [],
  exports: [CaelundasDatabaseService, TypeOrmModule],
  imports: [
    PersistenceDatabaseModule.forRoot({
      entities: [...CAELUNDAS_DATABASE_ENTITIES],
      project: "caelundas",
    }),
    TypeOrmModule.forFeature([...CAELUNDAS_DATABASE_ENTITIES]),
  ],
  providers: [CaelundasDatabaseService],
})
export class CaelundasDatabaseModule {}
