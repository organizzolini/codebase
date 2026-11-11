import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { VersionPackagesService } from "./version-packages.service";

/**
 * CLI command that versions ic-suite packages and writes changelogs,
 * uncommitted, after pointing `origin` at the release token and pushing missing
 * tags.
 *
 * Reads `GITHUB_TOKEN` and `GITHUB_ENV`, where `RELEASE_SUPERSEDED=true` is
 * written when `main` has moved. Exits with Nx's code, the tagging's when that
 * failed, or 1 otherwise.
 */
@Command({
  description:
    "Version the ic-suite packages and write their changelogs, uncommitted",
  name: "version-packages",
})
@Injectable()
export class VersionPackagesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly versionPackagesService: VersionPackagesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(VersionPackagesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Versions the release group, and exits with the outcome. */
  public async run(): Promise<void> {
    try {
      process.exitCode = await this.versionPackagesService.run();
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
