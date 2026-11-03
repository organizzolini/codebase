import { Module } from "@nestjs/common";

import { PostgresqlUtilitiesModule } from "../postgresql-utilities/postgresql-utilities.module";

import { PostgresqlExportCommand } from "./postgresql-export.command";

/**
 * Registers the `postgresql-export` command, which dumps selected tables from a
 * database named by URI to a custom-format file.
 */
@Module({
  controllers: [],
  exports: [PostgresqlExportCommand],
  imports: [PostgresqlUtilitiesModule],
  providers: [PostgresqlExportCommand],
})
export class PostgresqlExportModule {}
