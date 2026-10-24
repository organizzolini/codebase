import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { SoftwareNamedService } from "./software-named.service";
import { SoftwareService } from "./software.service";

/**
 * CLI command that installs the developer tools that come after Node, and
 * makes SSH commit signatures verifiable.
 *
 * With no names, on a Mac that is Python, Ollama, Docker, GPG signing, the
 * infrastructure tools, and the database tools, and it starts the Ollama and
 * Docker daemons; on Linux, the release archive tools, Python, squawk, and
 * PostgreSQL 18. With names, such as `software gitleaks trivy postgres-client`,
 * it installs only those, and fails if one cannot be installed.
 *
 * Exits non-zero at the first install that fails. Safe to run again: a tool
 * already present is left alone.
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
