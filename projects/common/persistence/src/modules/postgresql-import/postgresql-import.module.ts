import { Module } from "@nestjs/common";

import { PostgresqlUtilitiesModule } from "../postgresql-utilities/postgresql-utilities.module";

import { PostgresqlImportCommand } from "./postgresql-import.command";

/**
 * Registers the `postgresql-import` command, which restores selected tables from a
 * dump file into a database named by URI.
 */
@Module({
  controllers: [],
  exports: [PostgresqlImportCommand],
  imports: [PostgresqlUtilitiesModule],
  providers: [PostgresqlImportCommand],
})
export class PostgresqlImportModule {}
