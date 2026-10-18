import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule as PersistenceDatabaseModule } from "@codebase/persistence";

import { DatabaseService } from "./database.service";
import { Meander } from "./entities/meander.entity";

/**
 * Wires up the Postgres database every meander is persisted to, through the
 * shared `@codebase/persistence` module: the server, credentials, database, and
 * schema the `MEANDERAW_POSTGRES_*` variables name, by default the
 * `meanderaw_development` database, its `meanderaw` schema, and the
 * `meanderaw_username` role.
 *
 * The table is built by the migrations under `./migrations`, run with
 * `nx run meanderaw-cli:migration:run`; the connection never synchronizes and
 * never runs them on start. A test exercising `DatabaseService`
 * boots this module against a throwaway Postgres container, migrated by the
 * same migrations, through `startDatabaseTestingModule`.
 */
@Module({
  controllers: [],
  exports: [DatabaseService, TypeOrmModule],
  imports: [
    PersistenceDatabaseModule.forRoot({
      entities: [Meander],
      project: "meanderaw",
    }),
    TypeOrmModule.forFeature([Meander]),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
