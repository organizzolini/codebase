import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import {
  PGDG_APT_SOURCE_FILE,
  PGDG_KEY_FILE,
  PGDG_KEY_URL,
  PGDG_REPOSITORY_URL,
  POSTGRES_APT_BIN_DIRECTORY,
  POSTGRES_APT_PACKAGE,
  POSTGRES_LINKED_TOOLS,
} from "./software.constants";

/**
 * Installs the database tools: squawk, the PostgreSQL migration linter, and
 * the PostgreSQL 18 client tools `pg_dump` and `pg_restore`.
 *
 * The client tools come from Homebrew on a Mac and from the PostgreSQL apt
 * repository on Linux, which is the only place Ubuntu and Debian publish 18.
 */
@Injectable()
export class SoftwareDatabaseService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareDatabaseService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether `pg_dump` exists and is PostgreSQL 18. */
  private hasPostgres18(): boolean {
    return (
      this.processRunner.locate("pg_dump") !== undefined &&
      this.processRunner
        .run("pg_dump", ["--version"], { capture: true })
        .stdout.includes("18.")
    );
  }

  /** Installs PostgreSQL 18 on this machine, however its package manager does. */
  private installPostgresClient(): void {
    if (this.processRunner.platform() === "darwin") {
      this.processRunner.runOrThrow("brew", ["install", "postgresql@18"]);
      this.processRunner.runOrThrow("brew", [
        "link",
        "--force",
        "--overwrite",
        "postgresql@18",
      ]);

      return;
    }

    if (
      process.getuid?.() !== 0 ||
      this.processRunner.locate("apt-get") === undefined
    ) {
      throw new Error(
        "apt-get is not usable here; install postgresql-client-18 by hand",
      );
    }

    this.installPostgresWithApt();
  }

  /** Installs the PostgreSQL 18 client from the PostgreSQL apt repository, as root. */
  private installPostgresWithApt(): void {
    const codename = /^VERSION_CODENAME=(\S+)$/mu.exec(
      fs.readFileSync("/etc/os-release", "utf8"),
    )?.[1];

    if (codename === undefined) {
      throw new Error("/etc/os-release does not name a VERSION_CODENAME");
    }

    const key = path.join(os.tmpdir(), "postgresql-key.asc");

    fs.writeFileSync(
      PGDG_APT_SOURCE_FILE,
      `deb ${PGDG_REPOSITORY_URL} ${codename}-pgdg main\n`,
    );
    this.processRunner.runOrThrow("curl", ["-fsSL", "-o", key, PGDG_KEY_URL]);
    this.processRunner.runOrThrow("gpg", [
      "--batch",
      "--yes",
      "--dearmor",
      "-o",
      PGDG_KEY_FILE,
      key,
    ]);
    this.processRunner.runOrThrow("apt-get", ["update", "-qq"]);
    this.processRunner.runOrThrow("apt-get", [
      "install",
      "-y",
      "-qq",
      POSTGRES_APT_PACKAGE,
    ]);

    // A PostgreSQL server of another version on this machine steers the
    // `pg_dump` wrapper in /usr/bin to its own version, so 18's are linked
    // ahead of it.
    const binaryDirectory = path.join(os.homedir(), ".local", "bin");

    this.processRunner.runOrThrow("mkdir", ["-p", binaryDirectory]);

    for (const tool of POSTGRES_LINKED_TOOLS) {
      this.processRunner.runOrThrow("ln", [
        "-sf",
        path.join(POSTGRES_APT_BIN_DIRECTORY, tool),
        path.join(binaryDirectory, tool),
      ]);
    }
  }

  /** Reads a tool's version for the summary, or says it is not installed. */
  private readVersion(command: string): string {
    const result = this.processRunner.run(command, ["--version"], {
      capture: true,
    });

    return result.status === 0 ? result.output.trim() : "not installed";
  }

  // 🌎 Public Methods

  /** Installs squawk and the PostgreSQL 18 tools. */
  public installDatabaseTools(): void {
    this.installSquawk();
    this.installPostgres();
  }

  /** Installs PostgreSQL 18 unless its tools are already present. */
  public installPostgres(): void {
    this.reporter.print(
      "🔍 Checking for PostgreSQL 18 tools (pg_dump, pg_restore)...",
    );

    if (this.hasPostgres18()) {
      this.reporter.print("👍 PostgreSQL 18 tools are already installed.");
    } else {
      this.reporter.print(
        "📦 PostgreSQL 18 tools not found or incorrect version. Installing...",
      );
      this.installPostgresClient();
      this.reporter.print("✅ PostgreSQL 18 tools installed.");
    }

    this.reporter.print(`   PostgreSQL:  ${this.readVersion("pg_dump")}`);
  }

  /**
   * Installs squawk globally through pnpm, which Node's own packages use, so
   * lint-staged finds a native binary on `PATH`.
   */
  public installSquawk(): void {
    this.reporter.print("🔍 Checking for squawk installation...");

    if (this.processRunner.locate("squawk") === undefined) {
      this.reporter.print("📦 squawk not found. Installing via pnpm...");
      this.processRunner.runOrThrow("pnpm", ["add", "-g", "squawk-cli"]);
      this.reporter.print("✅ squawk installed via pnpm.");
    } else {
      this.reporter.print("👍 squawk is already installed.");
    }

    this.reporter.print(`   Squawk:      ${this.readVersion("squawk")}`);
  }
}
