import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { HelmReleasesCommand } from "./helm-releases.command";
import { HelmReleasesService } from "./helm-releases.service";

/** Provides the command that lints or renders every Helm release. */
@Module({
  controllers: [],
  exports: [HelmReleasesCommand, HelmReleasesService],
  imports: [LoggerModule, ProcessRunnerModule],
  providers: [HelmReleasesCommand, HelmReleasesService],
})
export class HelmReleasesModule {}
