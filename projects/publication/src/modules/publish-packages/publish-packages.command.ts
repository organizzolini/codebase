import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { describeError } from "../process-runner/process-runner.utilities";

import { PublishPackagesService } from "./publish-packages.service";

/**
 * CLI command that publishes every release-group package not yet on npm, with
 * provenance, then mirrors each to GitHub Packages as `@<owner>/<project>`,
 * as the 📦 Publish Packages release step.
 *
 * Reads `NPM_TOKEN`, `GITHUB_PACKAGES_TOKEN`, `GITHUB_REPOSITORY_OWNER`,
 * `RUNNER_TEMP`, and, to rehearse against a local registry,
 * `NPM_REGISTRY` and `GITHUB_PACKAGES_REGISTRY`. Writes what it published to
 * `$RUNNER_TEMP/newly-published.txt` for `link-packages`. Exits with pnpm's
 * code when publishing to npm failed, and 1 when a mirror or an input failed.
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
