import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { DependenciesService } from "../dependencies/dependencies.service";
import { EnvironmentFilesService } from "../environment-files/environment-files.service";
import { HelmService } from "../helm/helm.service";
import { LocalServicesService } from "../local-services/local-services.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";
import { ShellConfigurationService } from "../shell-configuration/shell-configuration.service";
import { SoftwareService } from "../software/software.service";
import { SshSigningService } from "../ssh-signing/ssh-signing.service";

import { STARTUP_FILES } from "./setup.constants";

/**
 * Runs every step of a machine's setup that comes after Node.
 *
 * A developer's Mac runs them in the order they have always run in: shell
 * configuration, software, environment files, then dependencies. Shell
 * configuration comes first, so completions for tools the software step
 * installs later are only wired when setup is run a second time.
 *
 * Linux is what a Claude Code cloud session and the devcontainer run. It has
 * no Homebrew and no shell of its own to configure, and `scripts/installation.sh`
 * has already installed its packages, so only the environment files, the SSH
 * signing, Helm, and the local services apply.
 */
@Injectable()
export class SetupService {
  // 🏗 Dependency Injection

  constructor(
    private readonly shellConfigurationService: ShellConfigurationService,
    private readonly softwareService: SoftwareService,
    private readonly environmentFilesService: EnvironmentFilesService,
    private readonly dependenciesService: DependenciesService,
    private readonly sshSigningService: SshSigningService,
    private readonly localServicesService: LocalServicesService,
    private readonly helmService: HelmService,
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SetupService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Installs Helm, which the pre-commit hook lints the charts with, and warns
   * rather than fails: a machine whose Node toolchain is already done is not
   * worth stopping over a download.
   */
  private installHelm(): void {
    try {
      this.helmService.installHelm();
    } catch (error) {
      this.reporter.print(
        `⚠️  Helm was not installed (${error instanceof Error ? error.message : String(error)}). Retry with: pnpm exec nx run installation:start:helm`,
      );
    }
  }

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

  /** Sets up a Linux machine: the files, the signing, Helm, and the services. */
  private async setUpLinux(): Promise<void> {
    this.environmentFilesService.createEnvironmentFiles();
    this.sshSigningService.configureSshSigning();
    this.installHelm();
    await this.localServicesService.startLocalServices();
    this.reporter.print("");
    this.reporter.print("✅ Linux setup complete.");
  }

  /** Sets up a developer's Mac. */
  private async setUpMac(): Promise<void> {
    this.shellConfigurationService.configureShell();
    await this.softwareService.installSoftware();
    this.environmentFilesService.createEnvironmentFiles();
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
