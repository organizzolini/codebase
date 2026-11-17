import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { RefreshDocumentationCommand } from "./refresh-documentation.command";
import { RefreshDocumentationService } from "./refresh-documentation.service";

/**
 * Provides the refresh-documentation command, which regenerates the OpenWiki
 * pages from code.
 */
@Module({
  controllers: [],
  exports: [RefreshDocumentationCommand, RefreshDocumentationService],
  imports: [LoggerModule],
  providers: [RefreshDocumentationCommand, RefreshDocumentationService],
})
export class RefreshDocumentationModule {}
