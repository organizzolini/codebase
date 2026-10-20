import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { TaskDatabaseService } from "../task-database/task-database.service";

/**
 * CLI command that discards every Nx task database that fails `PRAGMA integrity_check`.
 *
 * Reads `NX_WORKSPACE_DATA_DIRECTORY` and always exits 0: a warning is
 * printed, never a failure, because the cache is an optimization.
 */
@Command({
  description: "Discard every Nx task database that fails its integrity check",
  name: "verify-task-database",
})
@Injectable()
export class VerifyTaskDatabaseCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly taskDatabaseService: TaskDatabaseService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(VerifyTaskDatabaseCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Runs the step and prints what it reports. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    for (const line of this.taskDatabaseService.verify().lines) {
      console.info(line);
    }
  }
}
