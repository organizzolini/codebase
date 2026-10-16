import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/logging";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { DOCKER_READINESS_ATTEMPTS } from "./software.constants";

/**
 * Installs Docker Desktop and makes sure its daemon is running.
 *
 * docker-compose services (SearxNG, Open WebUI) need it for the affirmancy
 * application, and caelundas container images are built with it.
 */
@Injectable()
export class SoftwareDockerService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareDockerService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether the daemon answers `docker info`. */
  private isRunning(): boolean {
    return (
      this.processRunner.run("docker", ["info"], { capture: true }).status === 0
    );
  }

  /** Reads `docker --version`, trimmed. */
  private readVersion(): string {
    return this.processRunner
      .run("docker", ["--version"], { capture: true })
      .stdout.trim();
  }

  /** Launches Docker Desktop and waits for its daemon. */
  private async startDaemon(): Promise<void> {
    this.reporter.print("🚀 Starting Docker Desktop...");
    this.processRunner.runOrThrow("open", ["-a", "Docker"]);
    this.reporter.print("⏳ Waiting for Docker daemon to be ready...");

    for (let attempt = 0; attempt < DOCKER_READINESS_ATTEMPTS; attempt += 1) {
      if (this.isRunning()) {
        break;
      }

      await this.processRunner.sleep(2);
    }

    if (this.isRunning()) {
      this.reporter.print(`✅ Docker is running: ${this.readVersion()}`);
    } else {
      this.reporter.print(
        "⚠️  Docker daemon is taking longer than expected to start.",
      );
      this.reporter.print(
        "   Please wait for Docker Desktop to finish launching, then re-run setup.",
      );
    }
  }

  // 🌎 Public Methods

  /** Installs Docker Desktop and starts its daemon when either is missing. */
  public async installDocker(): Promise<void> {
    this.reporter.print("🔍 Checking for Docker installation...");

    if (this.processRunner.locate("docker") === undefined) {
      this.reporter.print(
        "📦 Docker not found. Installing Docker Desktop via Homebrew...",
      );
      this.processRunner.runOrThrow("brew", ["install", "--cask", "docker"]);
      this.reporter.print("✅ Docker Desktop installed");
    }

    this.reporter.print("🐳 Ensuring Docker daemon is running...");

    if (this.isRunning()) {
      this.reporter.print(`👍 Docker is running: ${this.readVersion()}`);
    } else {
      await this.startDaemon();
    }
  }
}
