import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import {
  affectedMessage,
  NONE_AFFECTED_MESSAGE,
} from "./publishable-packages-gate.constants";
import { PublishablePackagesGateService } from "./publishable-packages-gate.service";

/**
 * CLI command that runs `validation:verify-publishable-packages` when a change
 * between `NX_BASE` and `NX_HEAD` affects an ic-suite package or the check
 * itself, and does nothing otherwise.
 *
 * The consumer the check creates lives beneath
 * `PUBLISHABLE_PACKAGES_CONSUMER_ROOT`, which the workflow points at
 * `$RUNNER_TEMP`; the check inherits it from this process and refuses any
 * directory that is not outside the checkout. Exits with the check's own code,
 * or 1 when a revision is missing or Nx cannot say what is affected.
 */
@Command({
  description:
    "Run the publishable-packages check when an ic-suite package or the check is affected",
  name: "publishable-packages-gate",
})
@Injectable()
export class PublishablePackagesGateCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly gateService: PublishablePackagesGateService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(PublishablePackagesGateCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Decides whether the check is affected, then runs it whole or skips it. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const outcome = this.gateService.decide();

    if (outcome.kind === "failure") {
      console.error(outcome.message);
      process.exitCode = outcome.exitCode;

      return;
    }

    if (outcome.kind === "skip") {
      console.info(NONE_AFFECTED_MESSAGE);

      return;
    }

    console.info(affectedMessage(outcome.affected));
    process.exitCode = this.gateService.execute();
  }
}
