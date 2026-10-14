import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseGroupModule } from "../release-group/release-group.module";

import { LinkPackagesCommand } from "./link-packages.command";
import { LinkPackagesService } from "./link-packages.service";

/** Provides the command that links each published package to this repository. */
@Module({
  controllers: [],
  exports: [LinkPackagesCommand, LinkPackagesService],
  imports: [LoggerModule, ProcessRunnerModule, ReleaseGroupModule],
  providers: [LinkPackagesCommand, LinkPackagesService],
})
export class LinkPackagesModule {}
