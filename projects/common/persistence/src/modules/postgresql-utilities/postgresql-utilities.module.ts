import { Module } from "@nestjs/common";

import { PostgresqlUtilitiesService } from "./postgresql-utilities.service";

/**
 * Provides `PostgresqlUtilitiesService`, the one place the export and import
 * commands run `pg_dump` and `pg_restore` from.
 */
@Module({
  controllers: [],
  exports: [PostgresqlUtilitiesService],
  imports: [],
  providers: [PostgresqlUtilitiesService],
})
export class PostgresqlUtilitiesModule {}
