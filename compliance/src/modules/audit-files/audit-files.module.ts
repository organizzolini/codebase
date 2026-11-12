import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { AuditFilesCommand } from "./audit-files.command";
import { AuditFilesService } from "./audit-files.service";

/**
 * NestJS module providing repository governance validation.
 */
@Module({
  controllers: [],
  exports: [AuditFilesCommand, AuditFilesService],
  imports: [LoggerModule],
  providers: [AuditFilesCommand, AuditFilesService],
})
export class AuditFilesModule {}
