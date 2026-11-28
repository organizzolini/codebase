import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { HelmReleasesModule } from "../helm-releases/helm-releases.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { HelmLintCommand } from "./helm-lint.command";
import { HelmLintService } from "./helm-lint.service";

/** Provides the command that lints every Helm release. */
@Module({
  controllers: [],
  exports: [HelmLintCommand, HelmLintService],
  imports: [HelmReleasesModule, LoggerModule, ProcessRunnerModule],
  providers: [HelmLintCommand, HelmLintService],
})
export class HelmLintModule {}
