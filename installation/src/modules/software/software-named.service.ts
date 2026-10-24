import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { RELEASE_ARCHIVE_TOOLS } from "../release-archives/release-archives.constants";
import { ReleaseArchivesService } from "../release-archives/release-archives.service";

import { SoftwareDatabaseService } from "./software-database.service";
import {
  ARCHIVE_TOOL_NAMES,
  archiveToolOnMacMessage,
  NAMED_SOFTWARE,
  POSTGRES_CLIENT_NAME,
  POSTGRES_NOT_18_MESSAGE,
  POSTGRES_VERSION_MARKER,
  unknownNamesMessage,
} from "./software.constants";

import type { SoftwareEnvironment } from "./software.types";

/**
 * Installs just the software it is named, for a job or a machine that needs a
 * few of what `software` installs: any tool `software` installs from a release
 * archive (Linux only), and `postgres-client`, PostgreSQL 18's `pg_dump` and
 * `pg_restore` (Linux and Mac).
 *
 * These are the installs `software` makes, so a CI runner, a devcontainer, and
 * a laptop run one version of each tool. Naming software differs from asking
 * for everything in two ways: a tool that cannot be installed fails the run,
 * since it was asked for, and the apt steps go through `sudo` when this is not
 * root, as on a runner. The tools land in `~/.local/bin`, which is put first on
 * this process's `PATH`, so the check after the PostgreSQL install sees 18's
 * `pg_dump` rather than another version's, and appended to the file GitHub
 * Actions reads, when there is one.
 */
@Injectable()
export class SoftwareNamedService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<SoftwareEnvironment>,
    private readonly releaseArchivesService: ReleaseArchivesService,
    private readonly softwareDatabaseService: SoftwareDatabaseService,
    private readonly processRunner: ProcessRunnerService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareNamedService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Installs one release archive tool by name. */
  private installArchiveTool(name: string): void {
    const tool = RELEASE_ARCHIVE_TOOLS.find(
      ({ name: known }) => known === name,
    );

    if (tool === undefined) {
      throw new Error(unknownNamesMessage([name]));
    }

    this.releaseArchivesService.install(tool);
  }

  /** Installs PostgreSQL 18's client and checks that it is the one found first. */
  private installPostgresClient(): void {
    this.softwareDatabaseService.installPostgres();

    const version = this.processRunner.run("pg_dump", ["--version"], {
      capture: true,
    }).stdout;

    if (!version.includes(POSTGRES_VERSION_MARKER)) {
      throw new Error(POSTGRES_NOT_18_MESSAGE);
    }
  }

  /** Refuses names that are not software, and release archive tools on a Mac. */
  private validate(names: readonly string[]): void {
    const unknown = names.filter((name) => !NAMED_SOFTWARE.includes(name));

    if (unknown.length > 0) {
      throw new Error(unknownNamesMessage(unknown));
    }

    const mac = this.processRunner.platform() === "darwin";
    const archive = names.find((name) => ARCHIVE_TOOL_NAMES.has(name));

    if (mac && archive !== undefined) {
      throw new Error(archiveToolOnMacMessage(archive));
    }
  }

  // 🌎 Public Methods

  /**
   * Installs the named software, in the order named, and puts it on `PATH` for
   * the steps after.
   *
   * @param names - What to install: a release archive tool, or `postgres-client`.
   */
  public install(names: readonly string[]): void {
    this.validate(names);

    const binaryDirectory = path.join(os.homedir(), ".local", "bin");

    process.env["PATH"] =
      `${binaryDirectory}${path.delimiter}${process.env["PATH"] ?? ""}`;

    for (const name of new Set(names)) {
      if (name === POSTGRES_CLIENT_NAME) {
        this.installPostgresClient();
      } else {
        this.installArchiveTool(name);
      }
    }

    const pathFile = this.configService.get("GITHUB_PATH", { infer: true });

    if (pathFile !== undefined && pathFile !== "") {
      fs.appendFileSync(pathFile, `${binaryDirectory}\n`);
    }
  }
}
