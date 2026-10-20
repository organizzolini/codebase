import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import {
  HELM_LINUX_AMD64_SHA256,
  HELM_RELEASE_URL,
  HELM_VERSION,
} from "./software.constants";

/**
 * Installs helm on Linux from its pinned release, after checking the archive
 * against the SHA-256 that release publishes.
 *
 * A Linux image brings its packages with it, and helm is not one of them, so
 * setup installs the release this repository was tested with rather than
 * whatever the package index happens to hold.
 */
@Injectable()
export class SoftwareHelmService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareHelmService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Where the helm binary goes, in the same place the Node bootstrap links into. */
  private installDirectory(): string {
    return path.join(process.env["HOME"] ?? "", ".local", "bin");
  }

  /** Downloads, verifies, and installs the pinned release into a scratch directory. */
  private installRelease(directory: string): boolean {
    const archive = path.join(directory, "helm.tar.gz");

    if (
      this.step("curl", ["-fsSL", "-o", archive, HELM_RELEASE_URL]) ===
      undefined
    ) {
      return false;
    }

    const digest = this.step("sha256sum", [archive])?.split(" ", 1)[0];

    if (digest !== HELM_LINUX_AMD64_SHA256) {
      this.reporter.print(
        `⚠️  The ${HELM_VERSION} archive failed its checksum, so helm was not installed.`,
      );

      return false;
    }

    const binary = path.join(directory, "linux-amd64", "helm");

    return (
      this.step("tar", ["-xzf", archive, "-C", directory]) !== undefined &&
      this.step("mkdir", ["-p", this.installDirectory()]) !== undefined &&
      this.step("install", [
        "-m",
        "755",
        binary,
        path.join(this.installDirectory(), "helm"),
      ]) !== undefined
    );
  }

  /** Runs one command, and returns its trimmed standard output when it succeeds. */
  private step(command: string, args: string[]): string | undefined {
    const result = this.processRunner.run(command, args, { capture: true });

    return result.status === 0 ? result.stdout.trim() : undefined;
  }

  // 🌎 Public Methods

  /** Installs helm when it is missing. A failure is reported, not thrown. */
  public installHelmOnLinux(): void {
    if (this.processRunner.locate("helm") !== undefined) {
      this.reporter.print("👍 helm is already installed.");

      return;
    }

    if (this.step("uname", ["-m"]) !== "x86_64") {
      this.reporter.print(
        "⚠️  helm is missing, and this setup installs only the x86_64 release on Linux.",
      );

      return;
    }

    this.reporter.print(`📦 helm not found. Installing ${HELM_VERSION}...`);

    const directory = this.step("mktemp", ["-d"]);

    if (directory === undefined) {
      this.reporter.print(
        "⚠️  helm could not be installed: no scratch directory.",
      );

      return;
    }

    try {
      if (this.installRelease(directory)) {
        this.reporter.print(`✅ helm ${HELM_VERSION} installed.`);
      } else {
        this.reporter.print(
          `⚠️  helm ${HELM_VERSION} could not be installed. Retry with: curl -fsSL ${HELM_RELEASE_URL}`,
        );
      }
    } finally {
      this.step("rm", ["-rf", directory]);
    }
  }
}
