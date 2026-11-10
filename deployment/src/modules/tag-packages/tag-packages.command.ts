import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { TagPackagesService } from "./tag-packages.service";

/**
 * CLI command that commits any leftover versions, then tags each newly
 * versioned ic-suite package and pushes the tags, as the 🔖 Tag Packages
 * release step.
 *
 * Writes `RELEASE_SUPERSEDED=true` to `GITHUB_ENV` when `main` moved. Reads
 * `PUSH_RETRY_DELAY`. Exits with the last rejected push's code, 1 on any other
 * failure, and 0 otherwise.
 */
@Command({
  description:
    "Tag each newly versioned ic-suite package and push the tags, six at a time",
  name: "tag-packages",
})
@Injectable()
export class TagPackagesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly tagPackagesService: TagPackagesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(TagPackagesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Commits leftover versions, tags, and pushes, and exits with the outcome. */
  public async run(): Promise<void> {
    try {
      process.exitCode = await this.tagPackagesService.run();
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
