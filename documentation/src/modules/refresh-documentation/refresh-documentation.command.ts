import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { RefreshDocumentationService } from "./refresh-documentation.service";

/**
 * CLI command that refreshes the repository's OpenWiki documentation from
 * code, and is what the scheduled 🧑‍🏫 Refresh Documentation workflow runs.
 * It fails the process when OpenWiki does, so the workflow stops before it
 * opens a pull request.
 */
@Command({
  description: "Refresh the OpenWiki documentation from code",
  name: "refresh-documentation",
})
@Injectable()
export class RefreshDocumentationCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly refreshDocumentationService: RefreshDocumentationService,
  ) {
    super();
    this.logger.setContext(RefreshDocumentationCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Refreshes the documentation, failing the process when that fails. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; `CommandRunner.run` is.
    await Promise.resolve();

    this.logger.log("🧑‍🏫 Refreshing the OpenWiki documentation");

    if (!this.refreshDocumentationService.refresh()) {
      this.logger.error("❌ Failed refreshing the documentation with OpenWiki");
      process.exitCode = 1;
    }
  }
}
