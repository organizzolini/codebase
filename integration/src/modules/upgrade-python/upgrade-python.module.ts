import { Module } from "@nestjs/common";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { UpgradePythonService } from "./upgrade-python.service";

/** Provides the upgrade of the Python version the workspace runs. */
@Module({
  controllers: [],
  exports: [UpgradePythonService],
  imports: [ProcessRunnerModule],
  providers: [UpgradePythonService],
})
export class UpgradePythonModule {}
