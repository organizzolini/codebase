import { Module } from "@nestjs/common";

import { PostgresClientModule } from "../postgres-client/postgres-client.module";

import { ExportCommand } from "./export.command";

/**
 * Registers the `export` command, which dumps selected tables from a
 * database named by URI to a custom-format file.
 */
@Module({
  controllers: [],
  exports: [ExportCommand],
  imports: [PostgresClientModule],
  providers: [ExportCommand],
})
export class ExportModule {}
