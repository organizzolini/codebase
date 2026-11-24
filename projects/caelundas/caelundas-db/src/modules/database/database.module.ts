import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule as PersistenceDatabaseModule } from "@codebase/persistence";

import { DATABASE_ENTITIES } from "./data-source.constants";
import { DATABASE_PROJECT } from "./database.constants";
import { DatabaseService } from "./database.service";

/**
 * Connects an application to `caelundas_development`.`caelundas` as `caelundas_username`, through the shared `DatabaseModule.forRoot` and its naming strategy, with every caelundas entity registered. Never synchronizes or runs migrations on start: `nx run caelundas-db:migration:run` does that.
 *
 * Reads `CAELUNDAS_POSTGRES_*` via `ConfigService`, so the importing app's `ConfigModule` must be global.
 */
@Module({
  controllers: [],
  exports: [DatabaseService, TypeOrmModule],
  imports: [
    PersistenceDatabaseModule.forRoot({
      entities: [...DATABASE_ENTITIES],
      project: DATABASE_PROJECT,
    }),
    TypeOrmModule.forFeature([...DATABASE_ENTITIES]),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
