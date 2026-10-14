import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";

import { DependenciesCommand } from "./dependencies.command";
import { DependenciesService } from "./dependencies.service";

/** Provides the command that installs the workspace's dependencies. */
@Module({
  controllers: [],
  exports: [DependenciesCommand, DependenciesService],
  imports: [LoggerModule, ProcessRunnerModule, ReporterModule],
  providers: [DependenciesCommand, DependenciesService],
})
export class DependenciesModule {}
