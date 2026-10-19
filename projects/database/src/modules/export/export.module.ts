import { Module } from "@nestjs/common";

import { PostgresClientModule } from "../postgres-client/postgres-client.module";
import { SqliteExportModule } from "../sqlite-export/sqlite-export.module";

import { ExportCommand } from "./export.command";

/**
 * Registers the `export` command, which dumps selected tables from a
 * database named by URI to a custom-format file, or to a SQLite file.
 */
@Module({
  controllers: [],
  exports: [ExportCommand],
  imports: [PostgresClientModule, SqliteExportModule],
  providers: [ExportCommand],
})
export class ExportModule {}
