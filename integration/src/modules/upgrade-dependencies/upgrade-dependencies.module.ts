import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { UpgradeNodeModule } from "../upgrade-node/upgrade-node.module";
import { UpgradePnpmModule } from "../upgrade-pnpm/upgrade-pnpm.module";
import { UpgradePythonModule } from "../upgrade-python/upgrade-python.module";

import { UpgradeDependenciesCommand } from "./upgrade-dependencies.command";
import { UpgradeDependenciesService } from "./upgrade-dependencies.service";

/** Provides the command that runs the weekly dependency upgrades. */
@Module({
  controllers: [],
  exports: [UpgradeDependenciesCommand, UpgradeDependenciesService],
  imports: [
    LoggerModule,
    ProcessRunnerModule,
    UpgradeNodeModule,
    UpgradePnpmModule,
    UpgradePythonModule,
  ],
  providers: [UpgradeDependenciesCommand, UpgradeDependenciesService],
})
export class UpgradeDependenciesModule {}
