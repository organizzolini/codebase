import { Module } from "@nestjs/common";

import { PostgresqlUtilitiesModule } from "../postgresql-utilities/postgresql-utilities.module";

import { ExportCommand } from "./export.command";

/**
 * Registers the `export` command, which dumps selected tables from a
 * database named by URI to a custom-format file.
 */
@Module({
  controllers: [],
  exports: [ExportCommand],
  imports: [PostgresqlUtilitiesModule],
  providers: [ExportCommand],
})
export class ExportModule {}
