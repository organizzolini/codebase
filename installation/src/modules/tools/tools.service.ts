import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { RELEASE_ARCHIVE_TOOLS } from "../release-archives/release-archives.constants";
import { ReleaseArchivesService } from "../release-archives/release-archives.service";
import { SoftwareDatabaseService } from "../software/software-database.service";

import {
  isToolName,
  NO_TOOLS_MESSAGE,
  POSTGRES_NOT_18_MESSAGE,
  POSTGRES_VERSION_MARKER,
  unknownArchiveToolMessage,
  unknownToolsMessage,
} from "./tools.constants";

import type { ToolsEnvironment } from "./tools.types";

/**
 * Installs the tools it is asked for on a Linux machine: gitleaks and Trivy
 * from release archives whose checksums it verifies, and the PostgreSQL 18
 * client from the PostgreSQL apt repository.
 *
 * These are the installs `software` makes on a developer's Linux machine, so a
 * CI runner, a devcontainer, and a laptop run one version of each tool. This
 * picks a few of them, as a job needs, and differs in two ways: a tool that
 * cannot be installed fails the run, since it was asked for by name, and the
 * apt steps go through `sudo` when this is not root, as on a runner. The tools
 * land in `~/.local/bin`, which is put first on this process's `PATH`, so the
 * check after the PostgreSQL install sees 18's `pg_dump` rather than another
 * version's, and appended to the file GitHub Actions reads, when there is one.
 */
@Injectable()
export class ToolsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<ToolsEnvironment>,
    private readonly releaseArchivesService: ReleaseArchivesService,
    private readonly softwareDatabaseService: SoftwareDatabaseService,
    private readonly processRunner: ProcessRunnerService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ToolsService.name);
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
      throw new Error(unknownArchiveToolMessage(name));
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

  // 🌎 Public Methods

  /**
   * Installs the named tools, in the order named, and puts them on `PATH` for
   * the steps after.
   *
   * @param names - The tools to install: `gitleaks`, `trivy`, `postgres-client`.
   */
  public install(names: readonly string[]): void {
    const unknown = names.filter((name) => !isToolName(name));

    if (names.length === 0) {
      throw new Error(NO_TOOLS_MESSAGE);
    }
    if (unknown.length > 0) {
      throw new Error(unknownToolsMessage(unknown));
    }

    const binaryDirectory = path.join(os.homedir(), ".local", "bin");

    process.env["PATH"] =
      `${binaryDirectory}${path.delimiter}${process.env["PATH"] ?? ""}`;

    for (const name of new Set(names)) {
      if (name === "postgres-client") {
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
