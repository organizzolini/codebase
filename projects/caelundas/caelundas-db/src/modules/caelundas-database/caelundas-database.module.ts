import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule } from "@codebase/persistence";

import { CAELUNDAS_PROJECT } from "./caelundas-database.constants";
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
    DatabaseModule.forRoot({
      entities: [...CAELUNDAS_DATABASE_ENTITIES],
      project: CAELUNDAS_PROJECT,
    }),
    TypeOrmModule.forFeature([...CAELUNDAS_DATABASE_ENTITIES]),
  ],
  providers: [CaelundasDatabaseService],
})
export class CaelundasDatabaseModule {}
