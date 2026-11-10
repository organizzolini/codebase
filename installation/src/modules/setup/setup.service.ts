import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { DependenciesService } from "../dependencies/dependencies.service";
import { EnvironmentFilesService } from "../environment-files/environment-files.service";
import { LocalServicesService } from "../local-services/local-services.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { RemoteCacheService } from "../remote-cache/remote-cache.service";
import { ReporterService } from "../reporter/reporter.service";
import { ShellConfigurationService } from "../shell-configuration/shell-configuration.service";
import { SoftwareService } from "../software/software.service";

import { STARTUP_FILES } from "./setup.constants";

/**
 * Runs every step of a machine's setup that comes after Node, in order: shell
 * configuration, software, environment files, the remote Nx cache key, then dependencies.
 * Shell configuration goes first so completions are wired on a second run.
 *
 * Linux (a cloud session or devcontainer) has no Homebrew or shell to configure, so only
 * environment files, software, and local services apply.
 */
@Injectable()
export class SetupService {
  // 🏗 Dependency Injection

  constructor(
    private readonly shellConfigurationService: ShellConfigurationService,
    private readonly softwareService: SoftwareService,
    private readonly environmentFilesService: EnvironmentFilesService,
    private readonly dependenciesService: DependenciesService,
    private readonly localServicesService: LocalServicesService,
    private readonly remoteCacheService: RemoteCacheService,
    private readonly processRunner: ProcessRunnerService,
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

  /** Sets up a Linux machine: the files, the software it can have, and the services. */
  private async setUpLinux(): Promise<void> {
    this.environmentFilesService.createEnvironmentFiles();
    await this.softwareService.installSoftware();
    await this.localServicesService.startLocalServices();
    this.reporter.print("");
    this.reporter.print("✅ Linux setup complete.");
  }

  /** Sets up a developer's Mac. */
  private async setUpMac(): Promise<void> {
    this.shellConfigurationService.configureShell();
    await this.softwareService.installSoftware();
    this.environmentFilesService.createEnvironmentFiles();
    this.remoteCacheService.setUpRemoteCache();
    this.dependenciesService.installDependencies();
    this.printCompletion();
  }

  // 🌎 Public Methods

  /**
   * Runs the steps for this operating system, stopping at the first that
   * fails.
   *
   * @throws Error - When this is neither macOS nor Linux.
   */
  public async setUp(): Promise<void> {
    const platform = this.processRunner.platform();

    if (platform === "darwin") {
      await this.setUpMac();
    } else if (platform === "linux") {
      await this.setUpLinux();
    } else {
      throw new Error(
        `Unsupported operating system: ${platform}. Use macOS or Linux.`,
      );
    }
  }
}
