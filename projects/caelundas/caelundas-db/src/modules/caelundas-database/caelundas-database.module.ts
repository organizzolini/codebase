import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule } from "@codebase/persistence";

import { CAELUNDAS_PROJECT } from "./caelundas-database.constants";
import { CaelundasDatabaseService } from "./caelundas-database.service";
import { CAELUNDAS_DATABASE_ENTITIES } from "./data-source.constants";

/**
 * Connects an application to `caelundas_development`.`caelundas` as
 * `caelundas_username`, the way every database-backed project does, through
 * the shared `DatabaseModule.forRoot` and its naming strategy, with every
 * caelundas entity registered. Never synchronizes and never runs migrations
 * on start: they run on their own, with `nx run caelundas-db:migration:run`.
 *
 * Reads `CAELUNDAS_POSTGRES_*` through `ConfigService`, so the importing
 * application's `ConfigModule` must be global.
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
