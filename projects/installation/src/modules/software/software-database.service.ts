import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/logging";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

/**
 * Installs the database tools: squawk, the PostgreSQL migration linter, and
 * the PostgreSQL 18 client tools `pg_dump` and `pg_restore`.
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

  /** Installs and links PostgreSQL 18 unless its tools are already present. */
  private installPostgres(): void {
    this.reporter.print(
      "🔍 Checking for PostgreSQL 18 tools (pg_dump, pg_restore)...",
    );

    if (this.hasPostgres18()) {
      this.reporter.print("👍 PostgreSQL 18 tools are already installed.");
    } else {
      this.reporter.print(
        "📦 PostgreSQL 18 tools not found or incorrect version. Installing via Homebrew...",
      );
      this.processRunner.runOrThrow("brew", ["install", "postgresql@18"]);
      this.processRunner.runOrThrow("brew", [
        "link",
        "--force",
        "--overwrite",
        "postgresql@18",
      ]);
      this.reporter.print("✅ PostgreSQL 18 tools installed and linked.");
    }

    this.reporter.print(`   PostgreSQL:  ${this.readVersion("pg_dump")}`);
  }

  /**
   * Installs squawk globally through pnpm, which Node's own packages use, so
   * lint-staged finds a native binary on `PATH`.
   */
  private installSquawk(): void {
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
}
