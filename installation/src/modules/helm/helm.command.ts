import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { HelmService } from "./helm.service";

/**
 * CLI command that installs Helm from its release archive when it is missing.
 *
 * For Linux, where there is no Homebrew; macOS installs Helm in the `software`
 * command. Exits non-zero when the download, checksum, or install fails. Safe
 * to run again: an installed Helm is left alone.
 */
@Command({
  description: "Install Helm from its release archive on Linux",
  name: "helm",
})
@Injectable()
export class HelmCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly helmService: HelmService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(HelmCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Installs Helm. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    this.helmService.installHelm();
  }
}
