import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { ImportPrTaskCacheService } from "./import-pr-task-cache.service";

/**
 * CLI command that imports the Nx task cache a pull request's run uploaded into
 * its merge group's run, so finished tasks are hits.
 *
 * Reads `GITHUB_REF`, `GITHUB_REPOSITORY`, `NX_CACHE_SCOPE`, `RUNNER_TEMP`, and
 * the cache locations. Always exits 0: any failure leaves a cold cache, never a
 * failed run.
 */
@Command({
  description:
    "Import the pull request's Nx task cache artifact into a merge group's run",
  name: "import-pr-task-cache",
})
@Injectable()
export class ImportPrTaskCacheCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly importPrTaskCacheService: ImportPrTaskCacheService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(ImportPrTaskCacheCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Imports the cache and prints what happened. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    for (const line of this.importPrTaskCacheService.import().lines) {
      console.info(line);
    }
  }
}
