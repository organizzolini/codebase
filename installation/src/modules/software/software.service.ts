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
 * Installs the developer tools that come after Node, on every machine setup
 * runs on, with different results on each.
 *
 * A developer's Mac has Homebrew, so it gets Python, Ollama, Docker, GPG, the
 * infrastructure tools (Helm among them), and the database tools, in the order
 * they were always installed in. Linux, which is what a Claude Code cloud
 * session and the devcontainer run, has no Homebrew, so it gets the tools a
 * commit and the security gate need, from their release archives and package
 * managers. Both then make SSH commit signatures verifiable, which installs
 * `ssh-keygen` only where it is missing.
 *
 * Homebrew, nvm, Node, and pnpm are installed by `scripts/installation.sh` before
 * this runs, because this runs on Node.
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
