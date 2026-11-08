import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { TagPackagesService } from "./tag-packages.service";

/**
 * CLI command that tags each newly versioned ic-suite package on the release
 * commit and pushes the tags, as the 🔖 Tag Packages release step, first
 * committing any versions no codebase release carried.
 *
 * Reads `GITHUB_ENV`, where `RELEASE_SUPERSEDED=true` is written when `main`
 * moved before the leftover commit could be pushed, and `PUSH_RETRY_DELAY`;
 * git reads the committer identity. Exits with the last rejected push's
 * code, 1 on any other failure, and 0 otherwise.
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
