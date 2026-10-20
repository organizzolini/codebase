import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { DependenciesService } from "./dependencies.service";

/**
 * CLI command that installs the workspace's dependencies: Node packages, the
 * Python environment, Terraform providers, and a kubeconfig.
 *
 * Exits non-zero at the first step that fails.
 */
@Command({
  description:
    "Install Node and Python dependencies, reset the Nx cache, initialize Terraform, and write kubeconfig",
  name: "dependencies",
})
@Injectable()
export class DependenciesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly dependenciesService: DependenciesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(DependenciesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Installs the dependencies. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    this.dependenciesService.installDependencies();
  }
}
