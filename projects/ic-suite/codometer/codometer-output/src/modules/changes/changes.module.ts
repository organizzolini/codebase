import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ChangesService } from "./changes.service";

/**
 * Diffs codometer reports and joins them to a baseline.
 *
 * Imports `LoggerModule` itself, since this library has no root module.
 * `LoggerModule` is `@Global()`, so `LoggerService` resolves wherever this
 * module is used.
 */
@Module({
  controllers: [],
  exports: [ChangesService],
  imports: [LoggerModule],
  providers: [ChangesService],
})
export class ChangesModule {}
