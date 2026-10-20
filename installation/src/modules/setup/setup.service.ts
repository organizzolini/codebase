import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { DependenciesService } from "../dependencies/dependencies.service";
import { EnvironmentFilesService } from "../environment-files/environment-files.service";
import { ReporterService } from "../reporter/reporter.service";
import { ShellConfigurationService } from "../shell-configuration/shell-configuration.service";
import { SoftwareService } from "../software/software.service";

import { STARTUP_FILES } from "./setup.constants";

/**
 * Runs every step of a developer machine's setup that comes after Node, in
 * the order they have always run in: shell configuration, software,
 * environment files, then dependencies.
 *
 * Shell configuration comes first, so completions for tools the software step
 * installs later are only wired when setup is run a second time.
 */
@Injectable()
export class SetupService {
  // 🏗 Dependency Injection

  constructor(
    private readonly shellConfigurationService: ShellConfigurationService,
    private readonly softwareService: SoftwareService,
    private readonly environmentFilesService: EnvironmentFilesService,
    private readonly dependenciesService: DependenciesService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SetupService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Says setup is done, and how to pick the shell configuration up now. */
  private printCompletion(): void {
    const shell = path.basename(process.env["SHELL"] ?? "");
    // Matched against the table rather than indexed by the environment's
    // value, so what is printed is always one of the table's own literals.
    const startupFile = Object.entries(STARTUP_FILES).find(
      ([name]) => name === shell,
    )?.[1];

    this.reporter.print("");
    this.reporter.print(
      "🎉 Setup complete! All tools and shell configuration are ready.",
    );
    this.reporter.print(
      "   New terminal windows will automatically have all tools available.",
    );

    if (startupFile !== undefined) {
      this.reporter.print("");
      this.reporter.print("   To activate in this terminal, run:");
      this.reporter.print(`   source ~/${startupFile}`);
    }
  }

  // 🌎 Public Methods

  /** Runs every setup step, stopping at the first that fails. */
  public async setUp(): Promise<void> {
    this.shellConfigurationService.configureShell();
    await this.softwareService.installSoftware();
    this.environmentFilesService.createEnvironmentFiles();
    this.dependenciesService.installDependencies();
    this.printCompletion();
  }
}
