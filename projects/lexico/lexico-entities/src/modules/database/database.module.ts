import { Module } from "@nestjs/common";

import { DatabaseModule as PersistenceDatabaseModule } from "@codebase/persistence";

import { LEXICO_DATABASE_ENTITIES } from "./data-source.constants";
import { LexicoNamingStrategy } from "./database.constants";
import { DatabaseService } from "./database.service";

/**
 * Connects lexico to `lexico_development`.`lexico` as `lexico_username`, the
 * way every database-backed project does, through the shared
 * `PersistenceDatabaseModule.forRoot` and lexico's pluralizing naming
 * strategy. Never
 * synchronizes and never runs migrations on start.
 *
 * Reads `LEXICO_POSTGRES_*` through `ConfigService`, so the importing
 * application's `ConfigModule` must be global.
 */
@Module({
  controllers: [],
  exports: [DatabaseService, PersistenceDatabaseModule],
  imports: [
    PersistenceDatabaseModule.forRoot({
      entities: [...LEXICO_DATABASE_ENTITIES],
      namingStrategy: new LexicoNamingStrategy(),
      project: "lexico",
    }),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
