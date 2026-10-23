import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  BASELINE_DIRECTORY,
  collectedMessage,
  EXAMPLES_PREFIX,
  NO_REPORTS_MESSAGE,
  REPORT_FILE_NAME,
  SKIPPED_DIRECTORIES,
} from "./collect-codometer-baseline.constants";

import type { CollectCodometerBaselineReport } from "./collect-codometer-baseline.types";

/**
 * Gathers every project's codometer report into the baseline directory, keeping
 * each at the path it was found, so a later pull request can diff against it.
 */
@Injectable()
export class CollectCodometerBaselineService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Lists the reports beneath a directory, relative to the root, in name order. */
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
        !relative.startsWith(EXAMPLES_PREFIX)
      ) {
        reports.push(relative);
      }
    }

    return reports;
  }

  // 🌎 Public Methods

  /**
   * Copies each report found beneath a root into the baseline directory.
   *
   * @param root - The workspace root to search and to put the baseline in.
   * @returns Lines saying how many reports were gathered, or that none were.
   */
  public collect(root = process.cwd()): CollectCodometerBaselineReport {
    const reports = this.findReports(root);

    fs.mkdirSync(path.join(root, BASELINE_DIRECTORY), { recursive: true });

    for (const report of reports) {
      const destination = path.join(root, BASELINE_DIRECTORY, report);

      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(root, report), destination);
    }

    return {
      lines: [
        reports.length === 0
          ? NO_REPORTS_MESSAGE
          : collectedMessage(reports.length),
      ],
    };
  }
}
