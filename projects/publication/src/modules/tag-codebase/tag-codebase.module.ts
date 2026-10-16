import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { MainTipModule } from "../main-tip/main-tip.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { TagCodebaseCommand } from "./tag-codebase.command";
import { TagCodebaseService } from "./tag-codebase.service";

/** Provides the command that versions and tags the codebase itself. */
@Module({
  controllers: [],
  exports: [TagCodebaseCommand, TagCodebaseService],
  imports: [LoggerModule, MainTipModule, ProcessRunnerModule],
  providers: [TagCodebaseCommand, TagCodebaseService],
})
export class TagCodebaseModule {}
