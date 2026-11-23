import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule as PersistenceDatabaseModule } from "@codebase/persistence";

import { DATABASE_ENTITIES } from "./data-source.constants";
import { DATABASE_PROJECT } from "./database.constants";
import { DatabaseService } from "./database.service";
import { MeanderawDatabaseAggregatesService } from "./modules/aggregate/meanderaw-database-aggregates.service";

/**
 * Connects an application to the Postgres database `MEANDERAW_POSTGRES_*` names, through the shared `DatabaseModule.forRoot` and its naming strategy, with every meanderaw entity registered. Never synchronizes or runs migrations on start: `nx run meanderaw-db:migration:run` does that.
 *
 * Reads `MEANDERAW_POSTGRES_*` via `ConfigService`, so the importing app's `ConfigModule` must be global.
 */
@Module({
  controllers: [],
  exports: [MeanderawDatabaseAggregatesService, DatabaseService, TypeOrmModule],
  imports: [
    PersistenceDatabaseModule.forRoot({
      entities: [...DATABASE_ENTITIES],
      project: DATABASE_PROJECT,
    }),
    TypeOrmModule.forFeature([...DATABASE_ENTITIES]),
  ],
  providers: [MeanderawDatabaseAggregatesService, DatabaseService],
})
export class DatabaseModule {}
