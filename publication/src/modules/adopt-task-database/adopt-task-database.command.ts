import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { TaskDatabaseService } from "../task-database/task-database.service";

/**
 * CLI command that renames the newest restored Nx task database to this
 * machine's id and discards the rest.
 *
 * Reads `NX_WORKSPACE_DATA_DIRECTORY`, and `MACHINE_ID_FILES` to take the id
 * from other files than Nx's own. Always exits 0: a warning is printed, never
 * a failure, because the cache is an optimization.
 */
@Command({
  description:
    "Rename the newest restored Nx task database to this machine's id",
  name: "adopt-task-database",
})
@Injectable()
export class AdoptTaskDatabaseCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly taskDatabaseService: TaskDatabaseService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(AdoptTaskDatabaseCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Runs the step and prints what it reports. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    for (const line of this.taskDatabaseService.adopt().lines) {
      console.info(line);
    }
  }
}
