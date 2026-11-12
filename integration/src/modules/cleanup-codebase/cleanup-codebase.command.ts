import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { TaskDatabaseService } from "../task-database/task-database.service";

import { ENABLED_VALUE } from "./cleanup-codebase.constants";

import type { Environment } from "../../integration.types";

/**
 * Tidies the CI job's Nx task database before the job saves it: discards
 * damaged databases, then keeps only the newest. Always exits 0, since the
 * cache is an optimization and a problem is a warning, not a failure.
 */
@Command({
  description:
    "Verify the Nx task database and keep only the newest, before the job saves it",
  name: "cleanup-codebase",
})
@Injectable()
export class CleanupCodebaseCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly taskDatabaseService: TaskDatabaseService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(CleanupCodebaseCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Verifies the database, keeps the newest, and prints what they report. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    if (this.configService.get("NX_CACHE", { infer: true }) !== ENABLED_VALUE) {
      return;
    }

    for (const report of [
      this.taskDatabaseService.verify(),
      this.taskDatabaseService.keep(),
    ]) {
      for (const line of report.lines) {
        console.info(line);
      }
    }
  }
}
