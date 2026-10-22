import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { DependenciesModule } from "../dependencies/dependencies.module";
import { EnvironmentFilesModule } from "../environment-files/environment-files.module";
import { LocalServicesModule } from "../local-services/local-services.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";
import { ShellConfigurationModule } from "../shell-configuration/shell-configuration.module";
import { SoftwareModule } from "../software/software.module";
import { SshSigningModule } from "../ssh-signing/ssh-signing.module";

import { SetupCommand } from "./setup.command";
import { SetupService } from "./setup.service";

/** Provides the command that runs every setup step in order. */
@Module({
  controllers: [],
  exports: [SetupCommand, SetupService],
  imports: [
    DependenciesModule,
    EnvironmentFilesModule,
    LocalServicesModule,
    LoggerModule,
    ProcessRunnerModule,
    ReporterModule,
    ShellConfigurationModule,
    SoftwareModule,
    SshSigningModule,
  ],
  providers: [SetupCommand, SetupService],
})
export class SetupModule {}
