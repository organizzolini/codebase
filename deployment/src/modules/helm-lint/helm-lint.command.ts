import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { HelmLintService } from "./helm-lint.service";

/**
 * CLI command that lints every Helm release this repository ships, for the
 * `deployment` project's `helm-lint` target.
 *
 * Exits 0 when every release passed and 1 otherwise.
 */
@Command({
  description: "Lint every Helm release this repository ships",
  name: "helm-lint",
})
@Injectable()
export class HelmLintCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly helmLintService: HelmLintService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(HelmLintCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Lints the releases, and exits with the outcome. */
  public async run(): Promise<void> {
    await Promise.resolve();

    try {
      process.exitCode = this.helmLintService.lint();
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
