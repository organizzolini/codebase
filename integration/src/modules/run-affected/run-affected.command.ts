import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { templateFilesHeading } from "./run-affected.constants";
import { RunAffectedService } from "./run-affected.service";

/**
 * CLI command that runs `nx affected` for one target, and when
 * `INCLUDE_TEMPLATES` is "true" and a template changed, once more over the
 * conformetry config. Exits with the first failing run's code, or 1 when an
 * input is missing.
 */
@Command({
  description:
    "Run nx affected for one target, and over the conformetry config when a template changed",
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

  /** Plans the affected runs, reports what a template added, and makes them. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const outcome = this.runAffectedService.plan();

    if (outcome.kind === "failure") {
      console.error(outcome.message);
      process.exitCode = outcome.exitCode;

      return;
    }

    this.report(templateFilesHeading(outcome.target), outcome.templateFiles);

    process.exitCode = this.runAffectedService.execute(outcome);
  }
}
