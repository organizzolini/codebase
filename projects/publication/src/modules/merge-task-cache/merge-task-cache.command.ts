import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { TaskDatabaseService } from "../task-database/task-database.service";

import { NO_SOURCE_MESSAGE } from "./merge-task-cache.constants";

/**
 * CLI command that merges another run's Nx task cache into this one, so the
 * tasks that run already finished are hits here too.
 *
 * Takes the source directory, holding `cache/` and `workspace-data/` as `.nx`
 * lays them out, and reads `NX_WORKSPACE_DATA_DIRECTORY` and
 * `NX_CACHE_DIRECTORY`. Always exits 0: a problem is a warning and a cold
 * cache, never a failed run.
 */
@Command({
  arguments: "[source-directory]",
  description: "Merge another run's Nx task cache into this one",
  name: "merge-task-cache",
})
@Injectable()
export class MergeTaskCacheCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly taskDatabaseService: TaskDatabaseService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(MergeTaskCacheCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Merges the cache the first parameter names, and prints what happened. */
  public async run(parameters: string[]): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const source = parameters[0] ?? "";

    if (source === "") {
      console.info(NO_SOURCE_MESSAGE);

      return;
    }

    for (const line of this.taskDatabaseService.merge(source).lines) {
      console.info(line);
    }
  }
}
