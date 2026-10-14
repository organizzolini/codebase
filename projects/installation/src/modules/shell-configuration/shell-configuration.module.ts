import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";

import { ShellConfigurationCommand } from "./shell-configuration.command";
import { ShellConfigurationService } from "./shell-configuration.service";

/** Provides the command that configures the shell's startup files. */
@Module({
  controllers: [],
  exports: [ShellConfigurationCommand, ShellConfigurationService],
  imports: [LoggerModule, ProcessRunnerModule, ReporterModule],
  providers: [ShellConfigurationCommand, ShellConfigurationService],
})
export class ShellConfigurationModule {}
