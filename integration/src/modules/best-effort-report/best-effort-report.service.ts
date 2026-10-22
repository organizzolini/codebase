import { randomUUID } from "node:crypto";
import fs from "node:fs";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { BestEffortLedgerService } from "../best-effort-ledger/best-effort-ledger.service";

import {
  detailBullet,
  SECTION_HEADING,
  SECTION_INTRODUCTION,
} from "./best-effort-report.constants";

import type { Environment } from "../../integration.types";
import type { BestEffortFailure } from "../best-effort-ledger/best-effort-ledger.types";
import type { BestEffortReport } from "./best-effort-report.types";

/**
 * Writes up the best-effort steps that were skipped, so the pull request the
 * job opens says what is missing from it instead of a quiet green run hiding
 * that a step has been failing for weeks.
 */
@Injectable()
export class BestEffortReportService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly ledger: BestEffortLedgerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** One failure, quoted in a collapsed block. */
  private quote(failure: BestEffortFailure): string {
    const tail = failure.tail.replaceAll("```", "'''");

    return [
      "<details>",
      `<summary>${failure.label} (exit ${String(failure.exitCode)})</summary>`,
      "",
      "```text",
      tail,
      "```",
      "",
      "</details>",
    ].join("\n");
  }

  /** Appends one multi-line value to the file GitHub Actions reads outputs from. */
  private writeOutput(name: string, value: string): void {
    const file = this.configService.get("GITHUB_OUTPUT", { infer: true });

    if (file === undefined || file === "") {
      return;
    }

    const delimiter = `EOF_${randomUUID()}`;

    fs.appendFileSync(file, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
  }

  // 🌎 Public Methods

  /**
   * Hands the write-up to the steps that follow, as the step's outputs, and to
   * the job's summary page.
   */
  public publish(report: BestEffortReport): void {
    this.writeOutput("count", String(report.count));
    this.writeOutput("details", report.details);
    this.writeOutput("section", report.section);

    const summary = this.configService.get("GITHUB_STEP_SUMMARY", {
      infer: true,
    });

    if (summary !== undefined && summary !== "" && report.count > 0) {
      fs.appendFileSync(summary, `${report.section}\n`);
    }
  }

  /** Reads the ledger and writes up what it records. */
  public render(): BestEffortReport {
    const failures = this.ledger.read();

    if (failures.length === 0) {
      return { count: 0, details: "", section: "" };
    }

    return {
      count: failures.length,
      details: failures
        .map((failure) => detailBullet(failure.label, failure.exitCode))
        .join("\n"),
      section: [
        SECTION_HEADING,
        SECTION_INTRODUCTION,
        ...failures.map((failure) => this.quote(failure)),
      ].join("\n\n"),
    };
  }
}
