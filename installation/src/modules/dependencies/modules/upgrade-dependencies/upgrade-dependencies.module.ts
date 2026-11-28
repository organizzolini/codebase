import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../../../process-runner/process-runner.module";
import { UpdateReuiSkillModule } from "../installed-skills/modules/update-reui-skill/update-reui-skill.module";

import { UpgradeNodeModule } from "./modules/upgrade-node/upgrade-node.module";
import { UpgradePnpmModule } from "./modules/upgrade-pnpm/upgrade-pnpm.module";
import { UpgradePythonModule } from "./modules/upgrade-python/upgrade-python.module";
import { UpgradeDependenciesCommand } from "./upgrade-dependencies.command";
import { UpgradeDependenciesService } from "./upgrade-dependencies.service";

/** Provides the command that runs the weekly dependency upgrades. */
@Module({
  controllers: [],
  exports: [UpgradeDependenciesCommand, UpgradeDependenciesService],
  imports: [
    LoggerModule,
    ProcessRunnerModule,
    UpdateReuiSkillModule,
    UpgradeNodeModule,
    UpgradePnpmModule,
    UpgradePythonModule,
  ],
  providers: [UpgradeDependenciesCommand, UpgradeDependenciesService],
})
export class UpgradeDependenciesModule {}
