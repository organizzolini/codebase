import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";

import { HelmService } from "./helm.service";

/** Provides the service that installs Helm from its release archive. */
@Module({
  controllers: [],
  exports: [HelmService],
  imports: [LoggerModule, ProcessRunnerModule, ReporterModule],
  providers: [HelmService],
})
export class HelmModule {}
