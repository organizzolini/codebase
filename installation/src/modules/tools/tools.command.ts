import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { ToolsService } from "./tools.service";

/**
 * CLI command that installs the named tools on a Linux machine: `gitleaks`,
 * `trivy`, and `postgres-client` (PostgreSQL 18's `pg_dump` and `pg_restore`).
 *
 * Reads `GITHUB_PATH` when it is set, the file GitHub Actions adds extra
 * `PATH` entries from. Exits non-zero when a named tool is unknown or cannot
 * be installed.
 */
@Command({
  arguments: "<tools...>",
  description:
    "Install the named tools: gitleaks, trivy, and postgres-client (PostgreSQL 18)",
  name: "tools",
})
@Injectable()
export class ToolsCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly toolsService: ToolsService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(ToolsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Installs the tools named on the command line. */
  public async run(tools: string[]): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    this.toolsService.install(tools);
  }
}
