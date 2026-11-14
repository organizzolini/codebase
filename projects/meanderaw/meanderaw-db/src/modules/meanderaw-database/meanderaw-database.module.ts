import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule } from "@codebase/persistence";

import { MEANDERAW_DATABASE_ENTITIES } from "./data-source.constants";
import { MEANDERAW_PROJECT } from "./meanderaw-database.constants";
import { MeanderawDatabaseService } from "./meanderaw-database.service";

/**
 * Connects an application to the Postgres database `MEANDERAW_POSTGRES_*` names, through the shared `DatabaseModule.forRoot` and its naming strategy, with every meanderaw entity registered. Never synchronizes or runs migrations on start: `nx run meanderaw-db:migration:run` does that.
 *
 * Reads `MEANDERAW_POSTGRES_*` via `ConfigService`, so the importing app's `ConfigModule` must be global.
 */
@Module({
  controllers: [],
  exports: [MeanderawDatabaseService, TypeOrmModule],
  imports: [
    DatabaseModule.forRoot({
      entities: [...MEANDERAW_DATABASE_ENTITIES],
      project: MEANDERAW_PROJECT,
    }),
    TypeOrmModule.forFeature([...MEANDERAW_DATABASE_ENTITIES]),
  ],
  providers: [MeanderawDatabaseService],
})
export class MeanderawDatabaseModule {}
