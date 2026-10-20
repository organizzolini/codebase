import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { TaskDatabaseService } from "../task-database/task-database.service";

/**
 * CLI command that keeps only the newest Nx task database, warning when there was more than
 * one.
 *
 * Reads `NX_WORKSPACE_DATA_DIRECTORY` and always exits 0: a warning is
 * printed, never a failure, because the cache is an optimization.
 */
@Command({
  description:
    "Keep only the newest Nx task database, warning when there was more than one",
  name: "keep-task-database",
})
@Injectable()
export class KeepTaskDatabaseCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly taskDatabaseService: TaskDatabaseService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(KeepTaskDatabaseCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Runs the step and prints what it reports. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    for (const line of this.taskDatabaseService.keep().lines) {
      console.info(line);
    }
  }
}
