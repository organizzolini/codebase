import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import { PYTHON_VERSION_CHECK } from "./software.constants";

/**
 * Installs uv and Python 3.14 or newer.
 *
 * uv manages the shared virtual environment of the Python workspace and
 * installs Python itself. 3.14 is the floor because the project's code uses
 * `match` statements and `tomllib`.
 */
@Injectable()
export class SoftwarePythonService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly softwareBrewService: SoftwareBrewService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwarePythonService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether `python3` exists and is 3.14 or newer. */
  private hasSupportedPython(): boolean {
    return (
      this.processRunner.locate("python3") !== undefined &&
      this.processRunner.run("python3", ["-c", PYTHON_VERSION_CHECK], {
        capture: true,
      }).status === 0
    );
  }

  /** Installs uv through Homebrew unless it is present. */
  private installUv(): void {
    this.reporter.print("🔍 Checking for uv installation...");

    if (this.processRunner.locate("uv") === undefined) {
      this.reporter.print("📦 uv not found. Installing via Homebrew...");
      this.processRunner.runOrThrow("brew", ["install", "uv"]);
      this.reporter.print(
        `✅ uv installed via Homebrew, version: ${this.readUvVersion()}`,
      );

      return;
    }

    this.reporter.print(
      `👍 uv is already installed, version: ${this.readUvVersion()}`,
    );

    if (this.softwareBrewService.listOutdated().split("\n").includes("uv")) {
      this.reporter.print("🔄 uv is outdated. To update, run: brew upgrade uv");
    }
  }

  /** Reads `uv --version`, trimmed. */
  private readUvVersion(): string {
    return this.processRunner
      .run("uv", ["--version"], { capture: true })
      .stdout.trim();
  }

  // 🌎 Public Methods

  /** Installs uv, then Python through it when the system one is too old. */
  public installPython(): void {
    this.installUv();

    this.reporter.print("🔍 Checking for Python 3.14+ installation...");

    if (this.hasSupportedPython()) {
      const version = this.processRunner.run("python3", ["--version"], {
        capture: true,
      });

      this.reporter.print(
        `👍 Python is already installed: ${version.stdout.trim()}`,
      );

      return;
    }

    this.reporter.print("📦 Python 3.14+ not found. Installing via uv...");
    this.processRunner.runOrThrow("uv", ["python", "install", "3.14"]);
    this.reporter.print("✅ Python installed via uv");
  }
}
