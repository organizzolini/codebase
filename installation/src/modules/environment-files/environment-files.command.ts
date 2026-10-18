import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { EnvironmentFilesService } from "./environment-files.service";

/**
 * CLI command that creates a `.env` from every `.env.default` that has none.
 *
 * Exits non-zero only when a file cannot be written.
 */
@Command({
  description:
    "Create a .env from every .env.default that has none, and set LOCAL_WORKSPACE_FOLDER in the root one",
  name: "environment-files",
})
@Injectable()
export class EnvironmentFilesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly environmentFilesService: EnvironmentFilesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(EnvironmentFilesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Creates the environment files. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    this.environmentFilesService.createEnvironmentFiles();
  }
}
