import { Module } from "@nestjs/common";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { MainTipService } from "./main-tip.service";

/** Provides the check every release step that pushes to `main` makes first. */
@Module({
  controllers: [],
  exports: [MainTipService],
  imports: [ProcessRunnerModule],
  providers: [MainTipService],
})
export class MainTipModule {}
