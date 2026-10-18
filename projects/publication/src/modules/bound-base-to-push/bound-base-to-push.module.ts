import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { BoundBaseToPushCommand } from "./bound-base-to-push.command";
import { BoundBaseToPushService } from "./bound-base-to-push.service";

/** Provides the command that bounds a push's Nx base to its previous tip. */
@Module({
  controllers: [],
  exports: [BoundBaseToPushCommand, BoundBaseToPushService],
  imports: [LoggerModule, ProcessRunnerModule],
  providers: [BoundBaseToPushCommand, BoundBaseToPushService],
})
export class BoundBaseToPushModule {}
