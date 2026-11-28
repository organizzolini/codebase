import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../../../process-runner/process-runner.service";
import { RELEASE_ARCHIVE_TOOLS } from "../../../release-archives/release-archives.constants";
import { ReleaseArchivesService } from "../../../release-archives/release-archives.service";
import {
  ARCHIVE_TOOL_NAMES,
  archiveToolOnMacMessage,
  GO_TOOLS,
  HELM_PLUGINS,
  NAMED_SOFTWARE,
  POSTGRES_CLIENT_NAME,
  POSTGRES_NOT_18_MESSAGE,
  POSTGRES_VERSION_MARKER,
  SOFTWARE_GROUPS,
  unknownNamesMessage,
} from "../../software.constants";

import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwareGoToolsService } from "./software-go-tools.service";
import { SoftwareHelmPluginsService } from "./software-helm-plugins.service";

import type { SoftwareEnvironment } from "../../software.types";

/**
 * Installs just the tools named: a release archive (Linux only), a Go linter, a Helm plugin, `postgres-client`, or a project group such as `infrastructure`.
 *
 * Installs match `software`, so every machine runs one version of each tool.
 * An uninstallable tool fails the run, since it was asked for.
 */
@Injectable()
export class SoftwareNamedService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<SoftwareEnvironment>,
    private readonly releaseArchivesService: ReleaseArchivesService,
    private readonly softwareDatabaseService: SoftwareDatabaseService,
    private readonly softwareGoToolsService: SoftwareGoToolsService,
    private readonly softwareHelmPluginsService: SoftwareHelmPluginsService,
    private readonly processRunner: ProcessRunnerService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareNamedService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Replaces each project group with its tools, keeping the order and dropping repeats. */
  private expand(names: readonly string[]): string[] {
    return [
      ...new Set(names.flatMap((name) => SOFTWARE_GROUPS[name] ?? [name])),
    ];
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

  /** Installs the release archive tool or Go linter of this name; `validate` has made sure one exists. */
  private installTool(name: string): void {
    for (const tool of RELEASE_ARCHIVE_TOOLS.filter(
      ({ name: known }) => known === name,
    )) {
      this.releaseArchivesService.install(tool);
    }

    for (const tool of GO_TOOLS.filter(({ name: known }) => known === name)) {
      this.softwareGoToolsService.install(tool);
    }

    for (const plugin of HELM_PLUGINS.filter(
      ({ software }) => software === name,
    )) {
      this.softwareHelmPluginsService.install(plugin);
    }
  }

  /** Refuses names that are not software, and release archive tools on a Mac. */
  private validate(names: readonly string[]): void {
    const unknown = names.filter((name) => !NAMED_SOFTWARE.includes(name));

    if (unknown.length > 0) {
      throw new Error(unknownNamesMessage(unknown));
    }

    const mac = this.processRunner.platform() === "darwin";
    const archive = this.expand(names).find((name) =>
      ARCHIVE_TOOL_NAMES.has(name),
    );

    if (mac && archive !== undefined) {
      throw new Error(archiveToolOnMacMessage(archive));
    }
  }

  // 🌎 Public Methods

  /**
   * Installs the named software, a project group standing for its tools, in the order named, and puts it on `PATH` for later steps.
   */
  public install(names: readonly string[]): void {
    this.validate(names);

    const tools = this.expand(names);

    const binaryDirectory = path.join(os.homedir(), ".local", "bin");

    process.env["PATH"] =
      `${binaryDirectory}${path.delimiter}${process.env["PATH"] ?? ""}`;

    for (const name of tools) {
      if (name === POSTGRES_CLIENT_NAME) {
        this.installPostgresClient();
      } else {
        this.installTool(name);
      }
    }

    const pathFile = this.configService.get("GITHUB_PATH", { infer: true });

    if (pathFile !== undefined && pathFile !== "") {
      fs.appendFileSync(pathFile, `${binaryDirectory}\n`);
    }
  }
}
