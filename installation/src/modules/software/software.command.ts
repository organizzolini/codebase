import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { SoftwareService } from "./software.service";

/**
 * CLI command that installs the developer tools that come after Node, and
 * makes SSH commit signatures verifiable.
 *
 * On a Mac that is Python, Ollama, Docker, GPG signing, the infrastructure
 * tools, and the database tools, and it starts the Ollama and Docker daemons.
 * On Linux it is Helm alone.
 *
 * Exits non-zero at the first install that fails. Safe to run again: a tool
 * already present is left alone.
 */
@Command({
  description:
    "Install the developer tools this operating system gets, and make SSH commit signatures verifiable",
  name: "software",
})
@Injectable()
export class SoftwareCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly softwareService: SoftwareService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(SoftwareCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Installs the software. */
  public async run(): Promise<void> {
    await this.softwareService.installSoftware();
  }
}
