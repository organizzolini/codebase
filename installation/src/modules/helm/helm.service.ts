import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import {
  HELM_ARCHITECTURES,
  HELM_DOWNLOAD_URL,
  HELM_VERSION,
} from "./helm.constants";

/**
 * Installs Helm from its release archive, for machines with no Homebrew.
 *
 * A Claude Code cloud session and the devcontainer run Linux, which has no
 * Homebrew, so the software step that installs Helm through it never runs
 * there. Helm is needed all the same: the pre-commit hook lints the Helm
 * charts. The archive is checked against the checksum Helm publishes, and the
 * binary lands in `~/.local/bin`, which the Linux bootstrap puts on `PATH`.
 */
@Injectable()
export class HelmService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(HelmService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Downloads the archive and its checksum into `directory`, verifies it, and unpacks it. */
  private download(directory: string, archive: string): void {
    const url = `${HELM_DOWNLOAD_URL}/${archive}`;

    this.processRunner.runOrThrow("curl", [
      "-fsSL",
      "-o",
      path.join(directory, archive),
      url,
    ]);
    this.processRunner.runOrThrow("curl", [
      "-fsSL",
      "-o",
      path.join(directory, `${archive}.sha256sum`),
      `${url}.sha256sum`,
    ]);
    this.processRunner.runOrThrow("sha256sum", ["-c", `${archive}.sha256sum`], {
      cwd: directory,
    });
    this.processRunner.runOrThrow("tar", ["-xzf", archive], {
      cwd: directory,
    });
  }

  /** Helm's name for this machine's architecture, or a thrown error when it publishes none. */
  private resolveArchitecture(): string {
    const architecture = HELM_ARCHITECTURES[process.arch];

    const platform = this.processRunner.platform();

    if (platform !== "linux" || architecture === undefined) {
      throw new Error(
        `Helm is installed from its release archive on Linux only; this is ${platform}/${process.arch}. Use Homebrew instead.`,
      );
    }

    return architecture;
  }

  // 🌎 Public Methods

  /** Installs Helm into `~/.local/bin` unless it is already a command. */
  public installHelm(): void {
    this.reporter.print("🔍 Checking for helm installation...");

    if (this.processRunner.locate("helm") !== undefined) {
      this.reporter.print("👍 helm is already installed");

      return;
    }

    const platform = `linux-${this.resolveArchitecture()}`;
    const archive = `helm-${HELM_VERSION}-${platform}.tar.gz`;
    const binaryDirectory = path.join(os.homedir(), ".local", "bin");
    const directory = this.processRunner
      .runOrThrow("mktemp", ["-d"], { capture: true })
      .stdout.trim();

    this.reporter.print(`📦 helm not found. Installing ${HELM_VERSION}...`);

    try {
      this.download(directory, archive);
      this.processRunner.runOrThrow("mkdir", ["-p", binaryDirectory]);
      this.processRunner.runOrThrow("install", [
        "-m",
        "0755",
        path.join(directory, platform, "helm"),
        path.join(binaryDirectory, "helm"),
      ]);
    } finally {
      this.processRunner.run("rm", ["-rf", directory]);
    }

    this.reporter.print(
      `✅ helm ${HELM_VERSION} installed to ${binaryDirectory}`,
    );
  }
}
