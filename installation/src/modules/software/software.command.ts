import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { SoftwareNamedService } from "./software-named.service";
import { SoftwareService } from "./software.service";

/**
 * CLI command that installs developer tools and makes SSH commit signatures verifiable.
 *
 * With no names, installs the platform's default set and starts the Ollama and Docker daemons on a Mac.
 * With names, installs only those. Exits non-zero at the first failed install. Rerunning is safe.
 */
@Command({
  arguments: "[names...]",
  description:
    "Install the developer tools this operating system gets, or only the named ones, and make SSH commit signatures verifiable",
  name: "software",
})
@Injectable()
export class SoftwareCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly softwareService: SoftwareService,
    private readonly softwareNamedService: SoftwareNamedService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(SoftwareCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Installs the named software, or all of it when none is named. */
  public async run(names: readonly string[] = []): Promise<void> {
    if (names.length > 0) {
      this.softwareNamedService.install(names);

      return;
    }

    await this.softwareService.installSoftware();
  }
}
