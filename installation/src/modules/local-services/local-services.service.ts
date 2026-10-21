import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import {
  DOCKER_DAEMON_LOG_PATH,
  DOCKER_DAEMON_READINESS_ATTEMPTS,
  POSTGRES_UP_TARGET,
} from "./local-services.constants";

/**
 * Starts the services some applications need while they are developed: a
 * Docker daemon, and the Postgres container that runs on it.
 *
 * A machine that already reaches a daemon, like a devcontainer with the host's
 * socket mounted, is left alone. One that carries the daemon binary but runs
 * none, like a Claude Code cloud session, gets a daemon started, which needs
 * root. A service that cannot start prints why and leaves the rest of setup
 * alone, because the Node toolchain is already done by then.
 */
@Injectable()
export class LocalServicesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LocalServicesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Makes sure a daemon answers, starting one when this machine can. */
  private async ensureDaemon(): Promise<boolean> {
    if (this.isDaemonRunning()) {
      this.reporter.print("👍 A Docker daemon is already running.");

      return true;
    }

    if (
      process.getuid?.() !== 0 ||
      this.processRunner.locate("dockerd") === undefined
    ) {
      this.reporter.print(
        "⚠️  No Docker daemon is reachable, so Postgres was not started.",
      );

      return false;
    }

    if (await this.startDaemon()) {
      this.reporter.print("✅ The Docker daemon is running.");

      return true;
    }

    this.reporter.print(
      "⚠️  The Docker daemon did not start, so Postgres was not started.",
    );

    return false;
  }

  /** Whether a Docker daemon answers `docker info`. */
  private isDaemonRunning(): boolean {
    return (
      this.processRunner.run("docker", ["info"], { capture: true }).status === 0
    );
  }

  /** Starts a daemon of its own, detached, and waits for it to answer. */
  private async startDaemon(): Promise<boolean> {
    const logPath = path.join(os.homedir(), DOCKER_DAEMON_LOG_PATH);

    this.reporter.print("🐳 Starting the Docker daemon...");
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    this.processRunner.startDetached("sh", [
      "-c",
      `exec dockerd > "${logPath}" 2>&1`,
    ]);

    for (
      let attempt = 0;
      attempt < DOCKER_DAEMON_READINESS_ATTEMPTS;
      attempt += 1
    ) {
      if (this.isDaemonRunning()) {
        return true;
      }

      await this.processRunner.sleep(1);
    }

    return this.isDaemonRunning();
  }

  // 🌎 Public Methods

  /** Starts the Docker daemon when needed, then the Postgres container. */
  public async startLocalServices(): Promise<void> {
    if (!(await this.ensureDaemon())) {
      return;
    }

    this.reporter.print("🐘 Starting Postgres...");

    const result = this.processRunner.run("pnpm", [
      "exec",
      "nx",
      "run",
      POSTGRES_UP_TARGET,
    ]);

    if (result.status !== 0) {
      this.reporter.print(
        `⚠️  Postgres did not start. Retry with: pnpm exec nx run ${POSTGRES_UP_TARGET}`,
      );
    }
  }
}
