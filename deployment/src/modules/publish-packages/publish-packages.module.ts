import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseGroupModule } from "../release-group/release-group.module";

import { PublishPackagesCommand } from "./publish-packages.command";
import { PublishPackagesService } from "./publish-packages.service";

/** Provides the command that publishes the release group to npm and mirrors it to GitHub Packages. */
@Module({
  controllers: [],
  exports: [PublishPackagesCommand, PublishPackagesService],
  imports: [LoggerModule, ProcessRunnerModule, ReleaseGroupModule],
  providers: [PublishPackagesCommand, PublishPackagesService],
})
export class PublishPackagesModule {}
