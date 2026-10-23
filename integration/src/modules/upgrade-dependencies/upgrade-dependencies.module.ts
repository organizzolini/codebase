import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { UpgradeDependenciesCommand } from "./upgrade-dependencies.command";
import { UpgradeDependenciesService } from "./upgrade-dependencies.service";

/** Provides the command that runs the weekly dependency upgrades. */
@Module({
  controllers: [],
  exports: [UpgradeDependenciesCommand, UpgradeDependenciesService],
  imports: [LoggerModule, ProcessRunnerModule],
  providers: [UpgradeDependenciesCommand, UpgradeDependenciesService],
})
export class UpgradeDependenciesModule {}
