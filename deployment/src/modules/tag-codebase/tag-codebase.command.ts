import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { TagCodebaseService } from "./tag-codebase.service";

/**
 * CLI command that runs semantic-release for the codebase's own version, or
 * steps aside when `main` has moved, as the 🔖 Tag Codebase release step.
 *
 * Reads `GITHUB_ENV`, where `RELEASE_SUPERSEDED=true` is written when `main`
 * moved; semantic-release itself reads `GITHUB_TOKEN` and the committer
 * identity. Exits 0 when released or stepped aside, 1 otherwise.
 */
@Command({
  description:
    "Version and tag the codebase with semantic-release, stepping aside when main moved",
  name: "tag-codebase",
})
@Injectable()
export class TagCodebaseCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly tagCodebaseService: TagCodebaseService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(TagCodebaseCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Releases the codebase, and exits with the outcome. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    try {
      process.exitCode = this.tagCodebaseService.run();
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
