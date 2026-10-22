import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseArchivesModule } from "../release-archives/release-archives.module";
import { ReporterModule } from "../reporter/reporter.module";
import { SshSigningModule } from "../ssh-signing/ssh-signing.module";

import { SoftwareBrewService } from "./software-brew.service";
import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwareDockerService } from "./software-docker.service";
import { SoftwareGpgService } from "./software-gpg.service";
import { SoftwareInfraService } from "./software-infra.service";
import { SoftwareLinuxService } from "./software-linux.service";
import { SoftwareOllamaService } from "./software-ollama.service";
import { SoftwarePythonService } from "./software-python.service";
import { SoftwareCommand } from "./software.command";
import { SoftwareService } from "./software.service";

/** Provides the command that installs the developer tools after Node. */
@Module({
  controllers: [],
  exports: [SoftwareCommand, SoftwareService],
  imports: [
    LoggerModule,
    ProcessRunnerModule,
    ReleaseArchivesModule,
    ReporterModule,
    SshSigningModule,
  ],
  providers: [
    SoftwareBrewService,
    SoftwareCommand,
    SoftwareDatabaseService,
    SoftwareDockerService,
    SoftwareGpgService,
    SoftwareInfraService,
    SoftwareLinuxService,
    SoftwareOllamaService,
    SoftwarePythonService,
    SoftwareService,
  ],
})
export class SoftwareModule {}
