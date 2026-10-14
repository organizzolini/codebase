import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { ShellConfigurationService } from "./shell-configuration.service";

/**
 * CLI command that writes nvm, pnpm, GPG, Node.js, and completion
 * configuration to the shell's startup files.
 *
 * Safe to run again: each block is added once.
 */
@Command({
  description:
    "Write nvm, pnpm, GPG, Node.js memory, completion, and shell-helper configuration to the shell's startup files",
  name: "shell-configuration",
})
@Injectable()
export class ShellConfigurationCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly shellConfigurationService: ShellConfigurationService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(ShellConfigurationCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Configures the shell. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    this.shellConfigurationService.configureShell();
  }
}
