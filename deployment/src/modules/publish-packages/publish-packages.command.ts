import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { PublishPackagesService } from "./publish-packages.service";

/**
 * CLI command that publishes release-group packages missing from npm with
 * provenance, then mirrors them to GitHub Packages as `@<owner>/<project>`.
 *
 * Writes what it published to `$RUNNER_TEMP/newly-published.txt` for
 * `link-packages`. Exits with pnpm's code when publishing fails, and 1 when a
 * mirror or an input fails.
 */
@Command({
  description:
    "Publish the release group to npm, then mirror it to GitHub Packages",
  name: "publish-packages",
})
@Injectable()
export class PublishPackagesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly publishPackagesService: PublishPackagesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(PublishPackagesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Publishes and mirrors the release group, and exits with the outcome. */
  public async run(): Promise<void> {
    try {
      process.exitCode = await this.publishPackagesService.run();
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
