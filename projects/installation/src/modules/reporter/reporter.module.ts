import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { ReporterService } from "./reporter.service";

/** Provides the plain-text reporting every setup step prints through. */
@Module({
  controllers: [],
  exports: [ReporterService],
  imports: [LoggerModule],
  providers: [ReporterService],
})
export class ReporterModule {}
