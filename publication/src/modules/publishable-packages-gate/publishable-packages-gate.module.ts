import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { PublishablePackagesGateCommand } from "./publishable-packages-gate.command";
import { PublishablePackagesGateService } from "./publishable-packages-gate.service";

/** Provides the command that gates the publishable-packages check on what is affected. */
@Module({
  controllers: [],
  exports: [PublishablePackagesGateCommand, PublishablePackagesGateService],
  imports: [LoggerModule, ProcessRunnerModule],
  providers: [PublishablePackagesGateCommand, PublishablePackagesGateService],
})
export class PublishablePackagesGateModule {}
