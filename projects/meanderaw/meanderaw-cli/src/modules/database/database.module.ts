import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule as PersistenceDatabaseModule } from "@codebase/persistence";

import { DatabaseService } from "./database.service";
import { Meander } from "./entities/meander.entity";

/**
 * Wires up the Postgres database every meander is persisted to, through the
 * shared `@codebase/persistence` module and the `MEANDERAW_POSTGRES_*` variables.
 *
 * The table is built by the migrations under `./migrations`, run with
 * `nx run meanderaw-cli:migration:run`. The connection never synchronizes.
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
