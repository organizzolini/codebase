import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { PostgresqlExportModule } from "./modules/postgresql-export/postgresql-export.module";
import { PostgresqlImportModule } from "./modules/postgresql-import/postgresql-import.module";

/**
 * Root module of the database command line. Each command names its
 * database by URI, so it holds no `ConfigModule` and no `PostgresqlModule`:
 * the command line starts without any `<PROJECT>_POSTGRES_*` variable and
 * opens no connection until a command's options are validated.
 */
@Module({
  imports: [
    DiscoveryModule,
    LoggerModule,
    PostgresqlExportModule,
    PostgresqlImportModule,
  ],
})
export class MainModule {}
