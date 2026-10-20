import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { ExportModule } from "./modules/export/export.module";
import { ImportModule } from "./modules/import/import.module";

/**
 * Root module of the database command line. Each command names its
 * database by URI, so it holds no `ConfigModule` and no `PostgresqlModule`:
 * the command line starts without any `<PROJECT>_POSTGRES_*` variable and
 * opens no connection until a command's options are validated.
 */
@Module({
  imports: [DiscoveryModule, LoggerModule, ExportModule, ImportModule],
})
export class MainModule {}
