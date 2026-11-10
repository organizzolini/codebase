import path from "node:path";

import {
  DEFAULT_ERROR_WEIGHT,
  PERFECT_SCORE,
  ScoringService,
} from "@conformetry/languages";
import { Injectable } from "@nestjs/common";

import {
  REPORT_ERROR_DETAIL_INDENT,
  REPORT_FILE_DETAIL_INDENT,
  REPORT_FILE_INDENT,
  REPORT_SCORES_HEADING,
  REPORT_SUCCESS_MESSAGE,
  SCORE_PERCENTAGE_DIGITS,
  SCORE_PERCENTAGE_SCALE,
} from "./reporting.constants";

import type {
  FormatLocationArguments,
  FormatReportArguments,
} from "./reporting.types";
import type {
  ConformetryDifference,
  InstanceScore,
  ValidationFileResult,
} from "@conformetry/core";

/**
 * Renders structured conformance differences as human-readable text.
 *
 * Reports are grouped by file and then by error, and every error prints the
 * template requirement that produced it plus a concrete `fix` line. That last
 * part is the point: the output is meant to be actionable by whoever — or
 * whatever — is asked to make the file conform.
 */
@Injectable()
export class ReportingService {
  // 🏗 Dependency Injection

  constructor(private readonly scoringService: ScoringService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Renders one error: its message, locations, expected and actual values, and the fix.
   */
  private formatError(args: {
    error: ConformetryDifference;
    index: number;
    totalWeight: number;
  }): string[] {
    const { error } = args;

    return [
      "",
      `${REPORT_FILE_DETAIL_INDENT}${String(args.index + 1)}. ${error.message}`,
      ...this.formatLocation({
        column: error.instanceColumn,
        jsonPath: error.instancePath,
        line: error.instanceLine,
        prefix: "Instance",
      }),
      ...this.formatLocation({
        column: error.templateColumn,
        jsonPath: error.templatePath,
        line: error.templateLine,
        prefix: "Template",
      }),
      ...(error.expected === undefined
        ? []
        : [`${REPORT_ERROR_DETAIL_INDENT}Expected: \`${error.expected}\``]),
      ...(error.actual === undefined
        ? []
        : [`${REPORT_ERROR_DETAIL_INDENT}Actual  : \`${error.actual}\``]),
      // Only when this finding stands in for more than itself. Printing
      // "Weight: 1" on every leaf would be noise on the majority of findings,
      // and the point of the line is to say which one is worth fixing first.
      ...((error.weight ?? DEFAULT_ERROR_WEIGHT) <= DEFAULT_ERROR_WEIGHT
        ? []
        : [
            `${REPORT_ERROR_DETAIL_INDENT}Weight  : ${String(error.weight)} of the ${String(args.totalWeight)} requirements in this file`,
          ]),
      `${REPORT_ERROR_DETAIL_INDENT}Fix     : ${error.fix}`,
    ];
  }

  /**
   * Renders one failing file: a numbered heading, the instance and template
   * paths relative to the working directory, then each of its differences.
   */
  private formatFileResult(args: {
    fileResult: ValidationFileResult;
    index: number;
    workingDirectory: string;
  }): string[] {
    const { fileResult } = args;

    return [
      "",
      `${REPORT_FILE_INDENT}${String(args.index + 1)}. file: ${fileResult.filename}${this.formatFraction(
        {
          failedWeight: this.scoringService.sumWeights(fileResult.differences),
          totalWeight: fileResult.totalWeight,
        },
      )}`,
      `${REPORT_FILE_DETAIL_INDENT}Instance: ${path.relative(args.workingDirectory, fileResult.instanceFilePath)}`,
      `${REPORT_FILE_DETAIL_INDENT}Template: ${path.relative(args.workingDirectory, fileResult.templateFilePath)}`,
      ...fileResult.differences.flatMap((error, index) => {
        return this.formatError({
          error,
          index,
          totalWeight: fileResult.totalWeight,
        });
      }),
    ];
  }

  /**
   * Renders a weight pair as met/total requirements and a percentage.
   *
   * One renderer for every level, so the numbers always read alike.
   */
  private formatFraction(args: {
    failedWeight: number;
    totalWeight: number;
  }): string {
    const metWeight = args.totalWeight - args.failedWeight;
    const score = this.scoringService.calculateScore(args);

    return ` — ${String(metWeight)}/${String(args.totalWeight)} requirements met (${this.formatPercentage(score)})`;
  }

  /**
   * Renders a location line, preferring line and column over a JSON path.
   *
   * Empty for whole-file differences such as a missing file.
   */
  private formatLocation(args: FormatLocationArguments): string[] {
    if (args.line !== undefined) {
      const columnText =
        args.column === undefined ? "" : `, Column ${String(args.column)}`;

      return [
        `${REPORT_ERROR_DETAIL_INDENT}${args.prefix}: Line ${String(args.line)}${columnText}`,
      ];
    }

    if (args.jsonPath !== undefined) {
      return [
        `${REPORT_ERROR_DETAIL_INDENT}${args.prefix}: JSON path "${args.jsonPath}"`,
      ];
    }

    return [];
  }

  /** Renders one instance's score as a fraction, a percentage, and a verdict. */
  private formatScore(args: {
    score: InstanceScore;
    workingDirectory: string;
  }): string {
    const { score } = args;
    const verdict = score.ok
      ? `meets threshold ${this.formatPercentage(score.threshold)}`
      : `below threshold ${this.formatPercentage(score.threshold)}`;
    // Relative, like every other path the report prints. An absolute path here
    // and a relative one three lines below describe the same tree twice.
    const instancePath = path.relative(
      args.workingDirectory,
      score.instancePath,
    );

    return `${REPORT_FILE_INDENT}${score.ok ? "✓" : "✗"} ${instancePath} (${score.templateName})${this.formatFraction(score)}, ${verdict}`;
  }

  /**
   * Renders the summary of instances that did not score perfectly.
   *
   * The fraction shows the scale a percentage hides.
   */
  private formatScores(args: {
    scores: InstanceScore[];
    workingDirectory: string;
  }): string[] {
    const imperfect = args.scores.filter((score) => {
      return score.score < PERFECT_SCORE;
    });

    if (imperfect.length === 0) {
      return [];
    }

    return [
      REPORT_SCORES_HEADING,
      ...imperfect.map((score) => {
        return this.formatScore({
          score,
          workingDirectory: args.workingDirectory,
        });
      }),
      this.formatTotal(args.scores),
      "",
    ];
  }

  /**
   * Renders the run's total across every scored instance, not only the failures.
   *
   * A file under two templates counts twice.
   */
  private formatTotal(scores: InstanceScore[]): string {
    const failedWeight = scores.reduce((total, score) => {
      return total + score.failedWeight;
    }, 0);
    const totalWeight = scores.reduce((total, score) => {
      return total + score.totalWeight;
    }, 0);
    const belowCount = scores.filter((score) => !score.ok).length;

    return `${REPORT_FILE_INDENT}Total${this.formatFraction({ failedWeight, totalWeight })} across ${String(scores.length)} instance(s), ${String(belowCount)} below threshold`;
  }

  // 🌎 Public Methods

  /** Renders a 0-to-1 score as a percentage. */
  public formatPercentage(score: number): string {
    return `${(score * SCORE_PERCENTAGE_SCALE).toFixed(SCORE_PERCENTAGE_DIGITS)}%`;
  }

  /**
   * Renders every failing file as one report, with a score summary above it.
   *
   * Findings print even when their instance clears its threshold.
   */
  public formatReport(args: FormatReportArguments): string {
    const scoreLines = this.formatScores({
      scores: args.scores ?? [],
      workingDirectory: args.workingDirectory,
    });

    if (args.fileResults.length === 0) {
      return [...scoreLines, REPORT_SUCCESS_MESSAGE].join("\n");
    }

    return [
      ...scoreLines,
      ...args.fileResults.flatMap((fileResult, index) => {
        return this.formatFileResult({
          fileResult,
          index,
          workingDirectory: args.workingDirectory,
        });
      }),
    ]
      .join("\n")
      .trimStart();
  }
}
