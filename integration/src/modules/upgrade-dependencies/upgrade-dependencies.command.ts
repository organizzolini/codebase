import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import {
  NOTHING_SHIPPED_MESSAGE,
  skippedAnnotation,
  UPGRADE_STEPS,
} from "./upgrade-dependencies.constants";
import { UpgradeDependenciesService } from "./upgrade-dependencies.service";

import type {
  StepReport,
  UpgradeOutcome,
  UpgradeStep,
} from "./upgrade-dependencies.types";

/**
 * CLI command that runs the weekly dependency upgrades, each one undone and
 * reported if it fails, and writes the pull request that reports them.
 *
 * Reads `GITHUB_OUTPUT` and `GITHUB_RUN_ID` and sets the `has_dependency_updates` and `body_path`
 * outputs. Exits 0 when every step succeeded or was
 * skipped and something changed, and 1 when a failed step could not be undone
 * or skipped steps are all there is to report.
 */
@Command({
  description:
    "Run the weekly dependency upgrades, undoing and reporting any that fail, and write the pull request body",
  name: "upgrade-dependencies",
})
@Injectable()
export class UpgradeDependenciesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly upgradeDependenciesService: UpgradeDependenciesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(UpgradeDependenciesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Prints what a step came to, closes its log group, and records it.
   *
   * @returns Whether the run may carry on: only a step that could not be
   *   undone stops it.
   */
  private conclude(
    step: UpgradeStep,
    outcome: UpgradeOutcome,
    reports: StepReport[],
  ): boolean {
    console.info(outcome.output);
    console.info("::endgroup::");

    if (outcome.kind === "unrestored") {
      console.error(outcome.message);

      return false;
    }

    reports.push(outcome.report);

    if (outcome.report.skipped !== undefined) {
      console.info(
        skippedAnnotation(step.label, outcome.report.skipped.exitCode),
      );
    }

    return true;
  }

  // 🌎 Public Methods

  /** Runs every upgrade in turn, then reports what came of them. */
  public async run(): Promise<void> {
    const reports: StepReport[] = [];

    for (const step of UPGRADE_STEPS) {
      console.info(`::group::${step.label}`);

      const outcome = await this.upgradeDependenciesService.attempt(step);

      if (!this.conclude(step, outcome, reports)) {
        process.exitCode = 1;

        return;
      }
    }

    if (
      !this.upgradeDependenciesService.finish(reports) &&
      reports.some((report) => report.skipped !== undefined)
    ) {
      console.error(`::error::${NOTHING_SHIPPED_MESSAGE}`);
      process.exitCode = 1;
    }
  }
}
