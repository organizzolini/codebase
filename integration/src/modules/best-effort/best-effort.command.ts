import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { skippedAnnotation } from "./best-effort.constants";
import { BestEffortService } from "./best-effort.service";

/**
 * CLI command that runs one step of a job so its failure cannot fail the job.
 *
 * Reads its inputs from the environment, as the workflow sets them:
 * `BEST_EFFORT_LABEL`, `BEST_EFFORT_RUN`, `BEST_EFFORT_PATHS`, and
 * `BEST_EFFORT_RECOVER`. Exits 0 when the step succeeds or is skipped, and 1
 * when an input is missing or the failed step's files could not be restored.
 */
@Command({
  description:
    "Run one step; when it fails, restore its files, record the failure for the pull request, and exit 0",
  name: "best-effort",
})
@Injectable()
export class BestEffortCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly bestEffortService: BestEffortService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(BestEffortCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Runs the step, prints what it printed, and reports how it ended. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const outcome = this.bestEffortService.attempt();

    if (outcome.kind === "misconfigured") {
      console.error(outcome.message);
      process.exitCode = 1;

      return;
    }

    console.info(outcome.output);

    if (outcome.kind === "skipped") {
      console.info(
        skippedAnnotation(outcome.failure.label, outcome.failure.exitCode),
      );
    }

    if (outcome.kind === "unrestored") {
      console.error(outcome.message);
      process.exitCode = 1;
    }
  }
}
