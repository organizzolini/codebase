import { Module } from "@nestjs/common";

import { SqliteExportService } from "./sqlite-export.service";

/**
 * Provides `SqliteExportService`, which writes selected Postgres tables to
 * a SQLite file through the `pg` driver and `node:sqlite`.
 */
@Module({
  controllers: [],
  exports: [SqliteExportService],
  imports: [],
  providers: [SqliteExportService],
})
export class SqliteExportModule {}
