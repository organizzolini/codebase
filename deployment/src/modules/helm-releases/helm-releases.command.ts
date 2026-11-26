import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { USAGE } from "./helm-releases.constants";
import { HelmReleasesService } from "./helm-releases.service";

/**
 * CLI command that lints or renders every Helm release in the one release
 * table, for the infrastructure project's `helm-lint` and `helm-render`.
 *
 * Exits 0 when every release passed, 1 otherwise, and 2 on bad usage.
 */
@Command({
  arguments: "<mode> [directory]",
  description:
    "Lint or render every Helm release this repository ships from one table",
  name: "helm-releases",
})
@Injectable()
export class HelmReleasesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly helmReleasesService: HelmReleasesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(HelmReleasesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Lints or renders the releases, and exits with the outcome. */
  public async run(passedParameters: string[]): Promise<void> {
    const [mode, directory] = passedParameters;

    await Promise.resolve();

    try {
      if (mode === "lint") {
        process.exitCode = this.helmReleasesService.lint();
      } else if (mode === "render" && directory !== undefined) {
        this.helmReleasesService.render(directory);
        process.exitCode = 0;
      } else {
        console.error(USAGE);
        process.exitCode = 2;
      }
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
