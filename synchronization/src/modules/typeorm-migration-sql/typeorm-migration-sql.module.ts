import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { SynchronizationService } from "../synchronization/synchronization.service";

import { TypeormMigrationSqlExtractorService } from "./typeorm-migration-sql-extractor.service";
import { TypeormMigrationSqlCommand } from "./typeorm-migration-sql.command";

/**
 * TODO: Document the typeormMigrationSql module.
 */
@Module({
  controllers: [],
  exports: [TypeormMigrationSqlCommand],
  imports: [LoggerModule],
  providers: [
    SynchronizationService,
    TypeormMigrationSqlCommand,
    TypeormMigrationSqlExtractorService,
  ],
})
export class TypeormMigrationSqlModule {}
