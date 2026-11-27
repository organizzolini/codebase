import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { HelmReleasesModule } from "../helm-releases/helm-releases.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { HelmRenderCommand } from "./helm-render.command";
import { HelmRenderService } from "./helm-render.service";

/** Provides the command that renders every Helm release. */
@Module({
  controllers: [],
  exports: [HelmRenderCommand, HelmRenderService],
  imports: [HelmReleasesModule, LoggerModule, ProcessRunnerModule],
  providers: [HelmRenderCommand, HelmRenderService],
})
export class HelmRenderModule {}
