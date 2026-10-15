import { Module } from "@nestjs/common";

import { PostgresClientService } from "./postgres-client.service";

/**
 * Provides `PostgresClientService`, the one place the export and import
 * commands run `pg_dump` and `pg_restore` from.
 */
@Module({
  controllers: [],
  exports: [PostgresClientService],
  imports: [],
  providers: [PostgresClientService],
})
export class PostgresClientModule {}
