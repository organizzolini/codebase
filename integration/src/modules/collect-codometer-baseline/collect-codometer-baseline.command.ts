import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { CollectCodometerBaselineService } from "./collect-codometer-baseline.service";

/**
 * CLI command that gathers every project's codometer report into the
 * `codometer-baseline` directory, ready to be uploaded as the baseline the
 * next pull request is compared with.
 *
 * Reads nothing from the environment and always exits 0: a run with no
 * reports gathers nothing and says so.
 */
@Command({
  description:
    "Gather every project's codometer report into the baseline directory",
  name: "collect-codometer-baseline",
})
@Injectable()
export class CollectCodometerBaselineCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly collectCodometerBaselineService: CollectCodometerBaselineService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(CollectCodometerBaselineCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Gathers the reports and prints what it found. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    for (const line of this.collectCodometerBaselineService.collect().lines) {
      console.info(line);
    }
  }
}
