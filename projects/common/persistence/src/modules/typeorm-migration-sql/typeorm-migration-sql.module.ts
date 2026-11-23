import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { TypeormMigrationSqlExtractorService } from "./typeorm-migration-sql-extractor.service";
import { TypeormMigrationSqlCommand } from "./typeorm-migration-sql.command";

/**
 * Registers the `typeorm-migration-sql` command, which checks or writes the
 * SQL extracted from each TypeORM migration. Needs no other module.
 */
@Module({
  controllers: [],
  exports: [TypeormMigrationSqlCommand],
  imports: [LoggerModule],
  providers: [TypeormMigrationSqlCommand, TypeormMigrationSqlExtractorService],
})
export class TypeormMigrationSqlModule {}
