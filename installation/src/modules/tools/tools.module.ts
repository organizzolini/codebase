import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseArchivesModule } from "../release-archives/release-archives.module";
import { SoftwareModule } from "../software/software.module";

import { ToolsCommand } from "./tools.command";
import { ToolsService } from "./tools.service";

/** Provides the command that installs the tools a CI job asked for. */
@Module({
  controllers: [],
  exports: [ToolsCommand, ToolsService],
  imports: [
    LoggerModule,
    ProcessRunnerModule,
    ReleaseArchivesModule,
    SoftwareModule,
  ],
  providers: [ToolsCommand, ToolsService],
})
export class ToolsModule {}
