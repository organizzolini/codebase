import { appendFileSync } from "node:fs";

import { Injectable } from "@nestjs/common";

import {
  STEP_SUMMARY_FAILURE_MESSAGE,
  STEP_SUMMARY_VARIABLE,
} from "./issue-metadata.constants";

import type { IssueOutcome } from "./issue.types";

/** Joins the phases of an issue run into one report, and publishes it. */
@Injectable()
export class IssueReportService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** The report's lines, a blank line between phases, and the failure count. */
  public compose(outcomes: readonly IssueOutcome[]): {
    readonly failureCount: number;
    readonly lines: string[];
  } {
    const sections = outcomes.filter((outcome) => outcome.lines.length > 0);

    return {
      failureCount: outcomes.reduce(
        (count, outcome) => count + outcome.failures.length,
        0,
      ),
      lines: sections.flatMap((outcome, index) =>
        index === 0 ? [...outcome.lines] : ["", ...outcome.lines],
      ),
    };
  }

  /** Echoes the report, and mirrors it into the step summary when there is one. */
  public publish(lines: readonly string[]): void {
    for (const line of lines) {
      console.info(line);
    }

    const summaryPath = process.env[STEP_SUMMARY_VARIABLE];

    if (summaryPath === undefined || summaryPath === "" || lines.length === 0) {
      return;
    }

    try {
      appendFileSync(summaryPath, `${lines.join("\n")}\n`, "utf8");
    } catch {
      console.warn(STEP_SUMMARY_FAILURE_MESSAGE);
    }
  }
}
