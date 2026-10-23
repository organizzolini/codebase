import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { ReportCodometerChangesService } from "./report-codometer-changes.service";

/**
 * CLI command that writes codometer's changes against the latest `main`
 * baseline into a pull request's body.
 *
 * Reads `PULL_REQUEST`, `GITHUB_REPOSITORY`, `GITHUB_SERVER_URL`, and
 * `RUNNER_TEMP`, and `gh` its token from `GH_TOKEN`. Exits 1 when the pull
 * request is not named, or with the code of the step that failed; a baseline
 * that cannot be fetched is a warning, never a failure.
 */
@Command({
  description:
    "Write codometer's changes against the latest main baseline into a pull request body",
  name: "report-codometer-changes",
})
@Injectable()
export class ReportCodometerChangesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly reportCodometerChangesService: ReportCodometerChangesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(ReportCodometerChangesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Reports the changes, prints what happened, and sets the exit code. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const outcome = this.reportCodometerChangesService.report();

    for (const line of outcome.lines) {
      if (outcome.exitCode === 0) {
        console.info(line);
      } else {
        console.error(line);
      }
    }

    process.exitCode = outcome.exitCode;
  }
}
