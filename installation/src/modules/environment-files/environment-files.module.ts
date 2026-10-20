import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";

import { EnvironmentFilesCommand } from "./environment-files.command";
import { EnvironmentFilesService } from "./environment-files.service";

/** Provides the command that creates a `.env` from every `.env.default`. */
@Module({
  controllers: [],
  exports: [EnvironmentFilesCommand, EnvironmentFilesService],
  imports: [LoggerModule, ProcessRunnerModule, ReporterModule],
  providers: [EnvironmentFilesCommand, EnvironmentFilesService],
})
export class EnvironmentFilesModule {}
