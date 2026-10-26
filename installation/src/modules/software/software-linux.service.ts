import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { UV_WORKSPACE_PROJECT_PATH } from "../dependencies/dependencies.constants";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { RELEASE_ARCHIVE_TOOLS } from "../release-archives/release-archives.constants";
import { ReleaseArchivesService } from "../release-archives/release-archives.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwarePythonService } from "./software-python.service";

/**
 * Installs, on Linux, the developer tools a commit and the security gate need.
 *
 * Linux is what a Claude Code cloud session and the devcontainer run. It has
 * no Homebrew, so the tools come from their release archives, Python from uv,
 * the PostgreSQL client from the PostgreSQL apt repository, and squawk from
 * pnpm. Docker, Ollama, and GPG signing stay Mac-only: the daemon is started
 * elsewhere, Ollama is affirmancy's, and Linux signs with SSH.
 *
 * Every step warns rather than fails, so one unreachable download does not
 * stop a setup whose Node toolchain is already done.
 */
@Injectable()
export class SoftwareLinuxService {
  // 🏗 Dependency Injection

  constructor(
    private readonly releaseArchivesService: ReleaseArchivesService,
    private readonly softwarePythonService: SoftwarePythonService,
    private readonly softwareDatabaseService: SoftwareDatabaseService,
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareLinuxService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Runs one step, and says what failed and how to retry rather than throwing. */
  private attempt(step: string, install: () => void): void {
    try {
      install();
    } catch (error) {
      this.reporter.print(
        `⚠️  ${step} was not installed (${String(error)}). Retry with: pnpm exec nx run installation:start:software`,
      );
    }
  }

  // 🌎 Public Methods

  /** Installs every tool Linux gets, in the order each needs the one before. */
  public installLinuxTools(): void {
    for (const tool of RELEASE_ARCHIVE_TOOLS) {
      this.attempt(tool.name, () => {
        this.releaseArchivesService.install(tool);
      });
    }

    this.attempt("Python", () => {
      this.softwarePythonService.installPythonThroughUv();
    });
    this.attempt("The Python environment", () => {
      this.processRunner.runOrThrow("uv", [
        "sync",
        "--project",
        UV_WORKSPACE_PROJECT_PATH,
      ]);
    });
    this.attempt("squawk", () => {
      this.softwareDatabaseService.installSquawk();
    });
    this.attempt("PostgreSQL 18", () => {
      this.softwareDatabaseService.installPostgres();
    });
  }
}
