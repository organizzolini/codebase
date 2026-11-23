import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { PostgresqlExportModule } from "./modules/postgresql-export/postgresql-export.module";
import { PostgresqlImportModule } from "./modules/postgresql-import/postgresql-import.module";
import { RenderDirectedAcyclicGraphDataModule } from "./modules/render/modules/render-directed-acyclic-graph-data/render-directed-acyclic-graph-data.module";
import { RenderGraphDataModule } from "./modules/render/modules/render-graph-data/render-graph-data.module";
import { RenderTreeDataModule } from "./modules/render/modules/render-tree-data/render-tree-data.module";
import { TypeormMigrationSqlModule } from "./modules/typeorm-migration-sql/typeorm-migration-sql.module";

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
    RenderDirectedAcyclicGraphDataModule,
    RenderGraphDataModule,
    RenderTreeDataModule,
    TypeormMigrationSqlModule,
  ],
})
export class MainModule {}
