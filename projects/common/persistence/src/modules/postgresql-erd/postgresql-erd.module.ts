import { Module } from "@nestjs/common";

import { PostgresqlErdCommand } from "./postgresql-erd.command";
import { PostgresqlErdService } from "./postgresql-erd.service";

/** Exposes the ERD model reader and command through NestJS dependency injection. */
@Module({
  controllers: [],
  exports: [PostgresqlErdCommand, PostgresqlErdService],
  imports: [],
  providers: [PostgresqlErdCommand, PostgresqlErdService],
})
export class PostgresqlErdModule {}
