import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/logging";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { NO_KEY_INSTRUCTIONS } from "./software.constants";

/**
 * Installs GPG, points gpg-agent at pinentry-mac, and wires Git commit
 * signing.
 *
 * Every commit must be signed, which branch protection and commitlint
 * enforce. pinentry-mac is the macOS dialog that asks for the passphrase.
 */
@Injectable()
export class SoftwareGpgService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareGpgService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Points gpg-agent at pinentry-mac unless it already names a program. */
  private configureAgent(): void {
    this.reporter.print("🔐 Configuring gpg-agent to use pinentry-mac...");

    const directory = path.join(os.homedir(), ".gnupg");
    const configuration = path.join(directory, "gpg-agent.conf");
    const prefix = this.processRunner
      .run("brew", ["--prefix"], { capture: true })
      .stdout.trim();

    fs.mkdirSync(directory, { recursive: true });
    fs.chmodSync(directory, 0o700);

    if (
      fs.existsSync(configuration) &&
      fs.readFileSync(configuration, "utf8").includes("pinentry-program")
    ) {
      this.reporter.print("👍 gpg-agent.conf already configured");

      return;
    }

    fs.appendFileSync(
      configuration,
      `pinentry-program ${prefix}/bin/pinentry-mac\n`,
    );
    this.reporter.print("✅ pinentry-mac configured in gpg-agent.conf");
  }

  /** Tells Git to sign with the key, unless a signing key is already set. */
  private configureSigning(keyId: string): void {
    this.reporter.print("👍 GPG signing key found");
    this.reporter.print(`   Key ID: ${keyId}`);

    const configured = this.processRunner.run(
      "git",
      ["config", "--global", "user.signingkey"],
      { capture: true },
    );

    if (configured.status === 0) {
      this.reporter.print("👍 git signing already configured globally");

      return;
    }

    this.processRunner.runOrThrow("git", [
      "config",
      "--global",
      "user.signingkey",
      keyId,
    ]);
    this.processRunner.runOrThrow("git", [
      "config",
      "--global",
      "commit.gpgsign",
      "true",
    ]);
    this.processRunner.runOrThrow("git", [
      "config",
      "--global",
      "gpg.program",
      "gpg",
    ]);
    this.reporter.print(`✅ git global signing configured with key ${keyId}`);
  }

  /** Finds the id of the first secret key, such as `ABCDEF1234567890`. */
  private findSigningKeyId(): string | undefined {
    const listing = this.processRunner.run(
      "gpg",
      ["--list-secret-keys", "--keyid-format=long"],
      { capture: true },
    );
    const line = listing.stdout
      .split("\n")
      .find((entry) => entry.startsWith("sec"));

    return line?.split(/\s+/u)[1]?.split("/")[1];
  }

  /** Installs GPG and pinentry-mac through Homebrew unless GPG is present. */
  private installGpg(): void {
    this.reporter.print("🔍 Checking for GPG installation...");

    if (this.processRunner.locate("gpg") === undefined) {
      this.reporter.print("📦 GPG not found. Installing via Homebrew...");
      this.processRunner.runOrThrow("brew", [
        "install",
        "gnupg",
        "pinentry-mac",
      ]);
      this.reporter.print("✅ gnupg and pinentry-mac installed");

      return;
    }

    const version = this.processRunner.run("gpg", ["--version"], {
      capture: true,
    });

    this.reporter.print(
      `👍 GPG is already installed: ${version.stdout.split("\n", 1).join("")}`,
    );
  }

  // 🌎 Public Methods

  /** Installs GPG, configures its agent, and wires Git signing. */
  public installGpgSigning(): void {
    this.installGpg();
    this.configureAgent();

    this.reporter.print("🔐 Checking for existing GPG signing key...");

    const keyId = this.findSigningKeyId();

    if (keyId === undefined) {
      for (const line of NO_KEY_INSTRUCTIONS) {
        this.reporter.print(line);
      }
    } else {
      this.configureSigning(keyId);
    }
  }
}
