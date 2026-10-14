import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { spellingFilesHeading } from "./run-affected.constants";
import { RunAffectedService } from "./run-affected.service";

/**
 * CLI command that runs `nx affected` for one target between `NX_BASE` and
 * `NX_HEAD`, dropping spelling files from the change set unless
 * `INCLUDE_SPELLING` is "true".
 *
 * Reads its inputs from the environment, as the `run-affected` composite action
 * sets them: `TARGET`, `ARGUMENTS`, `INCLUDE_SPELLING`, `SPELLING_PATHS`,
 * `NX_BASE`, and `NX_HEAD`. Exits with `nx affected`'s own code, or 1 when an
 * input is missing.
 */
@Command({
  description:
    "Run nx affected for one target, without counting spelling files as changes",
  name: "run-affected",
})
@Injectable()
export class RunAffectedCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly runAffectedService: RunAffectedService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(RunAffectedCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Plans the affected run, reports what it dropped, and runs it. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const outcome = this.runAffectedService.plan();

    if (outcome.kind === "failure") {
      console.error(outcome.message);
      process.exitCode = outcome.exitCode;

      return;
    }

    if (outcome.spellingFiles.length > 0) {
      console.info(spellingFilesHeading(outcome.target));
      for (const file of outcome.spellingFiles) {
        console.info(`  ${file}`);
      }
    }

    process.exitCode = this.runAffectedService.execute(outcome);
  }
}
