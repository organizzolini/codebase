import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  BASELINE_ARTIFACT,
  BASELINE_DIRECTORY,
  collectedMessage,
  NO_PREVIOUS_BASELINE_MESSAGE,
  NO_REPORTS_MESSAGE,
  previousBaselineSkippedMessage,
  PROJECT_FILE_NAME,
  prunedMessage,
  REPORT_FILE_NAME,
  restoredMessage,
  SKIPPED_DIRECTORIES,
} from "./collect-codometer-baseline.constants";
import { buildFindBaselineArguments } from "./collect-codometer-baseline.utilities";

import type { Environment } from "../../integration.types";
import type { CollectCodometerBaselineReport } from "./collect-codometer-baseline.types";

/**
 * Gathers project reports into the baseline directory at the paths found,
 * laid over the earlier baseline: a push builds only what it affects, and a
 * project is dropped only once it no longer exists.
 */
@Injectable()
export class CollectCodometerBaselineService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Lists the reports already in the baseline directory, relative to it. */
  private findBaselineReports(baselineRoot: string, directory = ""): string[] {
    return fs
      .readdirSync(path.join(baselineRoot, directory), { withFileTypes: true })
      .flatMap((entry) => {
        const relative = path.posix.join(directory, entry.name);

        if (entry.isDirectory()) {
          return this.findBaselineReports(baselineRoot, relative);
        }

        return entry.name === REPORT_FILE_NAME ? [relative] : [];
      });
  }

  /** Lists the project reports beneath a directory, relative to the root, in name order. */
  private findReports(root: string, directory = ""): string[] {
    const reports: string[] = [];
    const entries = fs.readdirSync(path.join(root, directory), {
      withFileTypes: true,
    });

    for (const entry of entries.toSorted((left, right) =>
      left.name.localeCompare(right.name),
    )) {
      const relative = path.posix.join(directory, entry.name);

      if (entry.isDirectory() && !SKIPPED_DIRECTORIES.has(entry.name)) {
        reports.push(...this.findReports(root, relative));
      } else if (
        entry.isFile() &&
        entry.name === REPORT_FILE_NAME &&
        this.isProjectReport(root, directory)
      ) {
        reports.push(relative);
      }
    }

    return reports;
  }

  /** Whether a report sits in a project's own folder, or is the workspace's. */
  private isProjectReport(root: string, directory: string): boolean {
    return (
      directory === "" ||
      fs.existsSync(path.join(root, directory, PROJECT_FILE_NAME))
    );
  }

  /**
   * Drops carried-forward reports whose project folder is gone, so a removed or renamed project does not linger in the baseline forever.
   */
  private prune(root: string): number {
    const baselineRoot = path.join(root, BASELINE_DIRECTORY);
    let dropped = 0;

    for (const report of this.findBaselineReports(baselineRoot)) {
      if (
        !this.isProjectReport(
          root,
          path.posix.dirname(report).replace(/^\.$/u, ""),
        )
      ) {
        fs.rmSync(path.join(baselineRoot, report));
        dropped += 1;
      }
    }

    return dropped;
  }

  /**
   * Downloads the newest earlier baseline into the baseline directory. Failing to is only reported: this run's reports are still worth keeping.
   */
  private restorePrevious(root: string): string {
    const repository = this.configService.get("GITHUB_REPOSITORY", {
      infer: true,
    });

    if (repository === undefined || repository === "") {
      return NO_PREVIOUS_BASELINE_MESSAGE;
    }

    const listed = this.processRunner.capture(
      "gh",
      buildFindBaselineArguments(repository),
    );

    if (listed.status !== 0) {
      return previousBaselineSkippedMessage(listed.stderr.trim());
    }

    const runId = listed.stdout.trim();

    if (runId === "" || runId === "null") {
      return NO_PREVIOUS_BASELINE_MESSAGE;
    }

    const downloaded = this.processRunner.capture("gh", [
      "run",
      "download",
      runId,
      `--name=${BASELINE_ARTIFACT}`,
      `--dir=${path.join(root, BASELINE_DIRECTORY)}`,
    ]);

    if (downloaded.status !== 0) {
      return previousBaselineSkippedMessage(downloaded.stderr.trim());
    }

    return restoredMessage(
      this.findBaselineReports(path.join(root, BASELINE_DIRECTORY)).length,
    );
  }

  // 🌎 Public Methods

  /**
   * Restores the earlier baseline, then overlays each report beneath `root`.
   * @param root - Workspace root, searched and written to.
   * @returns Summary lines.
   */
  public collect(root = process.cwd()): CollectCodometerBaselineReport {
    fs.mkdirSync(path.join(root, BASELINE_DIRECTORY), { recursive: true });

    const restored = this.restorePrevious(root);
    const reports = this.findReports(root);

    for (const report of reports) {
      const destination = path.join(root, BASELINE_DIRECTORY, report);

      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(root, report), destination);
    }

    const dropped = this.prune(root);

    return {
      lines: [
        restored,
        ...(dropped === 0 ? [] : [prunedMessage(dropped)]),
        reports.length === 0
          ? NO_REPORTS_MESSAGE
          : collectedMessage(reports.length),
      ],
    };
  }
}
