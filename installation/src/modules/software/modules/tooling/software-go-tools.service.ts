import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../../../process-runner/process-runner.service";
import { ReporterService } from "../../../reporter/reporter.service";

import type { GoTool } from "../../software.types";

/**
 * Builds a command-line tool with `go install` from a pinned tag.
 *
 * The Go checksum database verifies the module, and Go builds for this machine.
 * The binary lands in `~/.local/bin`, which the named software service puts on `PATH`.
 */
@Injectable()
export class SoftwareGoToolsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareGoToolsService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Builds the tool unless it is already a command. */
  public install(tool: GoTool): void {
    this.reporter.print(`🔍 Checking for ${tool.name} installation...`);

    const directory = path.join(os.homedir(), ".local", "bin");

    if (
      this.processRunner.locate(tool.name) !== undefined ||
      fs.existsSync(path.join(directory, tool.name))
    ) {
      this.reporter.print(`👍 ${tool.name} is already installed`);

      return;
    }

    this.reporter.print(
      `📦 ${tool.name} not found. Building ${tool.version}...`,
    );
    this.processRunner.runOrThrow("mkdir", ["-p", directory]);
    this.processRunner.runOrThrow(
      "go",
      ["install", `${tool.module}@v${tool.version}`],
      { environment: { GOBIN: directory, GOTOOLCHAIN: "auto" } },
    );
    this.reporter.print(`✅ ${tool.name} ${tool.version} installed`);
  }
}
