import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseArchivesModule } from "../release-archives/release-archives.module";
import { ReporterModule } from "../reporter/reporter.module";
import { SshSigningModule } from "../ssh-signing/ssh-signing.module";

import { SoftwareBrewService } from "./modules/platform/software-brew.service";
import { SoftwareLinuxService } from "./modules/platform/software-linux.service";
import { SoftwareDockerService } from "./modules/runtimes/software-docker.service";
import { SoftwareOllamaService } from "./modules/runtimes/software-ollama.service";
import { SoftwarePythonService } from "./modules/runtimes/software-python.service";
import { SoftwareDatabaseService } from "./modules/tooling/software-database.service";
import { SoftwareGoToolsService } from "./modules/tooling/software-go-tools.service";
import { SoftwareGpgService } from "./modules/tooling/software-gpg.service";
import { SoftwareHelmPluginsService } from "./modules/tooling/software-helm-plugins.service";
import { SoftwareInfraService } from "./modules/tooling/software-infra.service";
import { SoftwareNamedService } from "./modules/tooling/software-named.service";
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
    SoftwareGoToolsService,
    SoftwareGpgService,
    SoftwareHelmPluginsService,
    SoftwareInfraService,
    SoftwareLinuxService,
    SoftwareNamedService,
    SoftwareOllamaService,
    SoftwarePythonService,
    SoftwareService,
  ],
})
export class SoftwareModule {}
