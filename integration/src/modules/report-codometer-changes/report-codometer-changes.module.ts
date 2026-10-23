import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { ReportCodometerChangesCommand } from "./report-codometer-changes.command";
import { ReportCodometerChangesService } from "./report-codometer-changes.service";

/** Provides the command that reports codometer's changes on a pull request. */
@Module({
  controllers: [],
  exports: [ReportCodometerChangesCommand, ReportCodometerChangesService],
  imports: [LoggerModule, ProcessRunnerModule],
  providers: [ReportCodometerChangesCommand, ReportCodometerChangesService],
})
export class ReportCodometerChangesModule {}
