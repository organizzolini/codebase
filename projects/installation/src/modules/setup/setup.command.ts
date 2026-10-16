import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { SetupService } from "./setup.service";

/**
 * CLI command that sets up a developer machine once Node and pnpm exist:
 * shell configuration, software, environment files, and dependencies.
 *
 * Exits non-zero at the first step that fails. Safe to run again.
 */
@Command({
  description:
    "Set up this machine: shell configuration, software, environment files, and dependencies",
  name: "setup",
})
@Injectable()
export class SetupCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly setupService: SetupService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(SetupCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Sets up the machine. */
  public async run(): Promise<void> {
    await this.setupService.setUp();
  }
}
