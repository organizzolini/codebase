import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { SshSigningService } from "../ssh-signing/ssh-signing.service";

import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwareDockerService } from "./software-docker.service";
import { SoftwareGpgService } from "./software-gpg.service";
import { SoftwareInfraService } from "./software-infra.service";
import { SoftwareLinuxService } from "./software-linux.service";
import { SoftwareOllamaService } from "./software-ollama.service";
import { SoftwarePythonService } from "./software-python.service";

/**
 * Installs the developer tools that come after Node, with a different set on each platform.
 *
 * A Mac gets Python, Ollama, Docker, GPG, the infrastructure tools, and database tools.
 * Linux, which has no Homebrew, gets the tools a commit and the security gate need.
 * Both then make SSH commit signatures verifiable.
 * Homebrew, nvm, Node, and pnpm are installed beforehand by `scripts/installation.sh`.
 */
@Injectable()
export class SoftwareService {
  // 🏗 Dependency Injection

  constructor(
    private readonly softwarePythonService: SoftwarePythonService,
    private readonly softwareOllamaService: SoftwareOllamaService,
    private readonly softwareDockerService: SoftwareDockerService,
    private readonly softwareGpgService: SoftwareGpgService,
    private readonly softwareInfraService: SoftwareInfraService,
    private readonly softwareDatabaseService: SoftwareDatabaseService,
    private readonly softwareLinuxService: SoftwareLinuxService,
    private readonly sshSigningService: SshSigningService,
    private readonly processRunner: ProcessRunnerService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Installs what a Mac with Homebrew gets, in order. */
  private async installWithHomebrew(): Promise<void> {
    this.softwarePythonService.installPython();
    await this.softwareOllamaService.installOllama();
    await this.softwareDockerService.installDocker();
    this.softwareGpgService.installGpgSigning();
    this.softwareInfraService.installInfrastructureTools();
    this.softwareDatabaseService.installDatabaseTools();
  }

  // 🌎 Public Methods

  /** Installs what this operating system gets, then makes SSH signatures verifiable. */
  public async installSoftware(): Promise<void> {
    if (this.processRunner.platform() === "darwin") {
      await this.installWithHomebrew();
    } else {
      this.softwareLinuxService.installLinuxTools();
    }

    this.sshSigningService.configureSshSigning();
  }
}
