import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";

import { ReleaseArchivesService } from "./release-archives.service";

/** Provides the service that installs command-line tools from their release archives. */
@Module({
  controllers: [],
  exports: [ReleaseArchivesService],
  imports: [LoggerModule, ProcessRunnerModule, ReporterModule],
  providers: [ReleaseArchivesService],
})
export class ReleaseArchivesModule {}
