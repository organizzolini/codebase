import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { TagCodebaseService } from "./tag-codebase.service";

import type { TagCodebaseOptions } from "./tag-codebase.types";

/**
 * CLI command that runs semantic-release for the codebase version, or steps
 * aside when `main` moved, as the 🔖 Tag Codebase release step.
 *
 * Writes `RELEASE_SUPERSEDED=true` to `GITHUB_ENV` when `main` moved. Exits 0
 * when released or stepped aside, 1 otherwise. With `--dry-run` it only previews.
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

  /** Parses `--dry-run`, which previews the release instead of making it. */
  @Option({
    description:
      "Preview the release without tagging, committing or publishing",
    flags: "--dry-run",
  })
  public parseDryRun(): boolean {
    return true;
  }

  /** Releases the codebase, and exits with the outcome. */
  public async run(
    _passedParameters: string[],
    options: TagCodebaseOptions = {},
  ): Promise<void> {
    try {
      process.exitCode = await this.tagCodebaseService.run(options);
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
