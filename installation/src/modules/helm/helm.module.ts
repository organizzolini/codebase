import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";

import { HelmCommand } from "./helm.command";
import { HelmService } from "./helm.service";

/** Provides the command that installs Helm from its release archive. */
@Module({
  controllers: [],
  exports: [HelmCommand, HelmService],
  imports: [LoggerModule, ProcessRunnerModule, ReporterModule],
  providers: [HelmCommand, HelmService],
})
export class HelmModule {}
