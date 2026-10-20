import { Module } from "@nestjs/common";

import { PostgresqlUtilitiesModule } from "../postgresql-utilities/postgresql-utilities.module";

import { ImportCommand } from "./import.command";

/**
 * Registers the `import` command, which restores selected tables from a
 * dump file into a database named by URI.
 */
@Module({
  controllers: [],
  exports: [ImportCommand],
  imports: [PostgresqlUtilitiesModule],
  providers: [ImportCommand],
})
export class ImportModule {}
