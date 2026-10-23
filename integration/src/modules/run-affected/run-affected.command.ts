import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import {
  spellingFilesHeading,
  templateFilesHeading,
} from "./run-affected.constants";
import { RunAffectedService } from "./run-affected.service";

/**
 * CLI command that runs `nx affected` for one target between `NX_BASE` and
 * `NX_HEAD`, dropping spelling files from the change set unless
 * `INCLUDE_SPELLING` is "true", and selecting every conformetry instance when a
 * template changed if `INCLUDE_TEMPLATES` is "true".
 *
 * Reads its inputs from the environment, as the `run-affected` composite action
 * sets them: `TARGET`, `ARGUMENTS`, `INCLUDE_SPELLING`, `INCLUDE_TEMPLATES`,
 * `NX_BASE`, and `NX_HEAD`. Exits with `nx affected`'s own code, or 1 when an
 * input is missing.
 */
@Command({
  description:
    "Run nx affected for one target over a change set corrected for spelling files and templates",
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

  /** Prints a heading, then each file under it, when there are any. */
  private report(heading: string, files: readonly string[]): void {
    if (files.length === 0) {
      return;
    }

    console.info(heading);
    for (const file of files) {
      console.info(`  ${file}`);
    }
  }

  // 🌎 Public Methods

  /** Plans the affected run, reports what it corrected, and runs it. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const outcome = this.runAffectedService.plan();

    if (outcome.kind === "failure") {
      console.error(outcome.message);
      process.exitCode = outcome.exitCode;

      return;
    }

    this.report(spellingFilesHeading(outcome.target), outcome.spellingFiles);
    this.report(templateFilesHeading(outcome.target), outcome.templateFiles);

    process.exitCode = this.runAffectedService.execute(outcome);
  }
}
