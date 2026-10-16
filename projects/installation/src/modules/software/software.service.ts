import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/logging";

import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwareDockerService } from "./software-docker.service";
import { SoftwareGpgService } from "./software-gpg.service";
import { SoftwareInfraService } from "./software-infra.service";
import { SoftwareOllamaService } from "./software-ollama.service";
import { SoftwarePythonService } from "./software-python.service";

/**
 * Installs the developer tools that come after Node: Python, Ollama, Docker,
 * GPG, the infrastructure tools, and the database tools.
 *
 * Homebrew, nvm, Node, and pnpm are installed by the bootstrap stub before
 * this runs, because this runs on Node. The order here is the order the tools
 * were always installed in.
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
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Installs every tool, in order. */
  public async installSoftware(): Promise<void> {
    this.softwarePythonService.installPython();
    await this.softwareOllamaService.installOllama();
    await this.softwareDockerService.installDocker();
    this.softwareGpgService.installGpgSigning();
    this.softwareInfraService.installInfrastructureTools();
    this.softwareDatabaseService.installDatabaseTools();
  }
}
