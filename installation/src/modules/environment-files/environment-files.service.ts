import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import {
  DEFAULT_FILE_NAME,
  DEFAULT_FILE_PATTERNS,
  ENVIRONMENT_FILE_NAME,
  WORKSPACE_VARIABLE_COMMENT,
  WORKSPACE_VARIABLE_NAME,
  WORKSPACE_VARIABLE_PATTERN,
} from "./environment-files.constants";

import type { EnvironmentFileTarget } from "./environment-files.types";

/**
 * Creates a `.env` beside every `.env.default`, so the stack runs without
 * anyone creating environment files by hand.
 *
 * An existing `.env` is never overwritten. The root one also gains the
 * workspace path docker-compose mounts volumes from, which the dev container
 * supplies itself and a local run has to derive.
 */
@Injectable()
export class EnvironmentFilesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(EnvironmentFilesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Adds the workspace path to the root `.env` when it does not name one. */
  private addWorkspaceVariable(workspaceRoot: string): void {
    const environmentFile = path.join(workspaceRoot, ENVIRONMENT_FILE_NAME);

    if (
      !fs.existsSync(environmentFile) ||
      WORKSPACE_VARIABLE_PATTERN.test(fs.readFileSync(environmentFile, "utf8"))
    ) {
      return;
    }

    fs.appendFileSync(
      environmentFile,
      `\n${WORKSPACE_VARIABLE_COMMENT}\n${WORKSPACE_VARIABLE_NAME}=${workspaceRoot}\n`,
    );
    this.reporter.print("✅ Added LOCAL_WORKSPACE_FOLDER to root .env");
  }

  /** Copies one `.env.default` to `.env` unless a `.env` is already there. */
  private createEnvironmentFile(
    workspaceRoot: string,
    target: EnvironmentFileTarget,
  ): void {
    const directory = path.join(workspaceRoot, target.directory);
    const environmentFile = path.join(directory, ENVIRONMENT_FILE_NAME);
    const defaultFile = path.join(directory, DEFAULT_FILE_NAME);

    if (fs.existsSync(environmentFile)) {
      this.reporter.print(`👍 ${target.label} .env already exists`);
    } else if (fs.existsSync(defaultFile)) {
      fs.copyFileSync(defaultFile, environmentFile);
      this.reporter.print(`✅ ${target.label} .env created from .env.default`);
    } else {
      this.reporter.print(
        `⚠️  ${target.label} .env.default not found. Skipping.`,
      );
    }
  }

  /** Lists every directory Git knows holds a `.env.default`, sorted and unique. */
  private findTargets(): EnvironmentFileTarget[] {
    const listing = this.processRunner.run(
      "git",
      [
        "ls-files",
        "--cached",
        "--others",
        "--exclude-standard",
        "--",
        ...DEFAULT_FILE_PATTERNS,
      ],
      { capture: true },
    );
    const files = new Set(listing.stdout.split("\n").filter(Boolean));

    return [...files].toSorted().map((file) => {
      const directory = path.dirname(file);

      return { directory, label: directory === "." ? "Root" : directory };
    });
  }

  // 🌎 Public Methods

  /** Bootstraps every project's `.env` from its `.env.default`. */
  public createEnvironmentFiles(): void {
    const workspaceRoot = process.cwd();

    this.reporter.print("🔍 Setting up environment files...");

    for (const target of this.findTargets()) {
      this.createEnvironmentFile(workspaceRoot, target);
    }

    this.addWorkspaceVariable(workspaceRoot);
  }
}
