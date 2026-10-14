import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/logging";

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
    const startupFile =
      STARTUP_FILES[path.basename(process.env["SHELL"] ?? "")];

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
      this.reporter.print(`   source ${path.join(os.homedir(), startupFile)}`);
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
