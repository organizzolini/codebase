import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { BestEffortReportService } from "./best-effort-report.service";

/**
 * CLI command that writes up the best-effort steps that were skipped.
 *
 * Reads the ledger `BEST_EFFORT_REPORT` names, and publishes `count`,
 * `details`, and `section` as step outputs through `GITHUB_OUTPUT`. Always
 * exits 0: deciding whether skipped steps should fail the job belongs to the
 * workflow, which knows whether a pull request shipped.
 */
@Command({
  description:
    "Write up the best-effort steps that were skipped, as step outputs for the pull request",
  name: "best-effort-report",
})
@Injectable()
export class BestEffortReportCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly bestEffortReportService: BestEffortReportService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(BestEffortReportCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Reads the ledger, publishes the write-up, and prints it. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const report = this.bestEffortReportService.render();

    this.bestEffortReportService.publish(report);

    console.info(
      report.count === 0
        ? "No best-effort step was skipped."
        : `${String(report.count)} best-effort step(s) skipped.\n\n${report.section}`,
    );
  }
}
