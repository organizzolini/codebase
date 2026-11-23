import { Module } from "@nestjs/common";

import { PostgresqlErdService } from "./postgresql-erd.service";

/** Exposes the ERD model reader through NestJS dependency injection. */
@Module({
  controllers: [],
  exports: [PostgresqlErdService],
  imports: [],
  providers: [PostgresqlErdService],
})
export class PostgresqlErdModule {}
