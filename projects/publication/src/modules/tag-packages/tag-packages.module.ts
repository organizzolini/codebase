import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { MainTipModule } from "../main-tip/main-tip.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseGroupModule } from "../release-group/release-group.module";

import { TagPackagesCommand } from "./tag-packages.command";
import { TagPackagesService } from "./tag-packages.service";

/** Provides the command that tags each newly versioned package and pushes the tags. */
@Module({
  controllers: [],
  exports: [TagPackagesCommand, TagPackagesService],
  imports: [
    LoggerModule,
    MainTipModule,
    ProcessRunnerModule,
    ReleaseGroupModule,
  ],
  providers: [TagPackagesCommand, TagPackagesService],
})
export class TagPackagesModule {}
