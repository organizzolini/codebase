import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { DocumentsService } from "./documents.service";

/**
 * Wraps a report body in markers and writes it where asked.
 *
 * Imports `LoggerModule` itself, since this library has no root module.
 * `LoggerModule` is `@Global()`, so `LoggerService` resolves wherever this
 * module is used.
 */
@Module({
  controllers: [],
  exports: [DocumentsService],
  imports: [LoggerModule],
  providers: [DocumentsService],
})
export class DocumentsModule {}
