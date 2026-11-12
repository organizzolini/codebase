import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { LinkPackagesService } from "./link-packages.service";

/**
 * CLI command that records every published npm version on the Linked artifacts
 * page and lists the ones this run published for 🔏 Attest Packages, as the
 * 🔗 Link Packages release step.
 *
 * Reads `GITHUB_REPOSITORY`, `GITHUB_REPOSITORY_OWNER`, `RUNNER_TEMP`, and
 * `GITHUB_OUTPUT`; `gh` reads `GH_TOKEN`. Exits 1 when any package or input failed.
 */
@Command({
  description:
    "Link each published package to this repository and list the ones to attest",
  name: "link-packages",
})
@Injectable()
export class LinkPackagesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly linkPackagesService: LinkPackagesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(LinkPackagesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Links the release group, and exits with the outcome. */
  public async run(): Promise<void> {
    try {
      process.exitCode = await this.linkPackagesService.run();
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
