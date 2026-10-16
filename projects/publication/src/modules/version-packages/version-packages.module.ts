import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { MainTipModule } from "../main-tip/main-tip.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { TagPackagesModule } from "../tag-packages/tag-packages.module";

import { VersionPackagesCommand } from "./version-packages.command";
import { VersionPackagesService } from "./version-packages.service";

/** Provides the command that versions the release group's packages. */
@Module({
  controllers: [],
  exports: [VersionPackagesCommand, VersionPackagesService],
  imports: [
    LoggerModule,
    MainTipModule,
    ProcessRunnerModule,
    TagPackagesModule,
  ],
  providers: [VersionPackagesCommand, VersionPackagesService],
})
export class VersionPackagesModule {}
