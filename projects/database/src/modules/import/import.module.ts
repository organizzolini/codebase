import { Module } from "@nestjs/common";

import { PostgresClientModule } from "../postgres-client/postgres-client.module";

import { ImportCommand } from "./import.command";

/**
 * Registers the `import` command, which restores selected tables from a
 * dump file into a database named by URI.
 */
@Module({
  controllers: [],
  exports: [ImportCommand],
  imports: [PostgresClientModule],
  providers: [ImportCommand],
})
export class ImportModule {}
