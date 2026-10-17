import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { RunAffectedCommand } from "./run-affected.command";
import { RunAffectedService } from "./run-affected.service";

/** Provides the command that runs `nx affected` for one target. */
@Module({
  controllers: [],
  exports: [RunAffectedCommand, RunAffectedService],
  imports: [LoggerModule, ProcessRunnerModule],
  providers: [RunAffectedCommand, RunAffectedService],
})
export class RunAffectedModule {}
