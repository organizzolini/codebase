import { Module } from "@nestjs/common";

import { DatabaseModule as PersistenceDatabaseModule } from "@codebase/persistence";

import { DATABASE_ENTITIES } from "./data-source.constants";
import { DATABASE_PROJECT } from "./database.constants";
import { DatabaseService } from "./database.service";

@Module({
  controllers: [],
  exports: [DatabaseService],
  imports: [
    PersistenceDatabaseModule.forRoot({
      entities: [...DATABASE_ENTITIES],
      project: DATABASE_PROJECT,
    }),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
