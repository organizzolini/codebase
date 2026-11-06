import { appendFileSync } from "node:fs";

import { Injectable } from "@nestjs/common";

import {
  STEP_SUMMARY_FAILURE_MESSAGE,
  STEP_SUMMARY_VARIABLE,
} from "./pull-request-github.constants";

import type { CheckOutcome } from "./pull-request.types";

/** Turns every phase's findings into one report, and publishes it. */
@Injectable()
export class PullRequestReportService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** One check's section: its failures and the commands that fix them. */
  private describeOutcome(outcome: CheckOutcome): string[] {
    if (outcome.failures.length === 0) {
      return [outcome.successMessage];
    }

    return [
      outcome.heading,
      "",
      ...outcome.failures.map((failure) => `- ${failure}`),
      ...(outcome.remediationCommands.length === 0
        ? []
        : [
            "",
            "🔧 Fix with:",
            "",
            ...outcome.remediationCommands.map((command) => `- ${command}`),
          ]),
    ];
  }

  // 🌎 Public Methods

  /** The lines of one run, and how many things were wrong with it. */
  public compose(options: {
    readonly outcomes: readonly CheckOutcome[];
    readonly writeFailures: readonly string[];
    readonly writeLines: readonly string[];
  }): { readonly failureCount: number; readonly lines: string[] } {
    const sections = [
      ...(options.writeLines.length === 0 && options.writeFailures.length === 0
        ? []
        : [
            [
              ...options.writeLines,
              ...options.writeFailures.map((failure) => `- ${failure}`),
            ],
          ]),
      ...options.outcomes.map((outcome) => this.describeOutcome(outcome)),
    ];
    const failureCount =
      options.writeFailures.length +
      options.outcomes.reduce(
        (count, outcome) => count + outcome.failures.length,
        0,
      );

    return {
      failureCount,
      lines: sections.flatMap((section, index) =>
        index === 0 ? section : ["", ...section],
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
