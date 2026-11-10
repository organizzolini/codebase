import { Injectable } from "@nestjs/common";

import {
  HEADROOM_BUCKET_AT_LIMIT,
  HEADROOM_BUCKET_FOUR_PLUS,
  HEADROOM_BUCKET_ONE,
  HEADROOM_BUCKET_ORDER,
  HEADROOM_BUCKET_OVER_LIMIT,
  HEADROOM_BUCKET_TWO_TO_THREE,
  HEADROOM_BUCKET_UNMEASURED,
  MARKDOWN_HEADROOM_HEADER,
  MARKDOWN_PROJECT_INDEX_HEADER,
  ROOT_PROJECT_LABEL,
} from "./report.constants";

import type {
  ProjectIndexRow,
  RenderProjectIndexArguments,
} from "./report.types";
import type {
  ProjectLimits,
  ProjectLimitsLookup,
} from "@callidescope/configuration";
import type { ProjectReport } from "@callidescope/core";

/**
 * Renders what a whole run says about the projects in it, rather than one callable or stack.
 *
 * Its two sections are the index and the scoreboard: which project holds what, and how much room
 * each has before its own limit stops it. Both key on each project's resolved limit.
 */
@Injectable()
export class WorkspaceReportService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Sorts a project's headroom into its scoreboard bucket. A project measuring nothing gets its own
   * bucket, not a large headroom.
   */
  private bucketFor(row: ProjectIndexRow): string {
    if (row.deepest === 0) {
      return HEADROOM_BUCKET_UNMEASURED;
    }

    if (row.headroom < 0) {
      return HEADROOM_BUCKET_OVER_LIMIT;
    }

    if (row.headroom === 0) {
      return HEADROOM_BUCKET_AT_LIMIT;
    }

    if (row.headroom === 1) {
      return HEADROOM_BUCKET_ONE;
    }

    return row.headroom <= 3
      ? HEADROOM_BUCKET_TWO_TO_THREE
      : HEADROOM_BUCKET_FOUR_PLUS;
  }

  /** The widest single callable a project declares, or zero when it has none. */
  private widestBreadth(report: ProjectReport): number {
    return report.callableBreadths.reduce(
      (widest, candidate) => Math.max(widest, candidate.breadth),
      0,
    );
  }

  // 🌎 Public Methods

  /**
   * Reads each project's report and resolved limits into one row, so both sections render from the
   * same rows.
   */
  public buildRows(args: RenderProjectIndexArguments): ProjectIndexRow[] {
    const rows = args.projects.map((report) => {
      const limits = this.limitsFor({
        limits: args.limits,
        projectName: report.projectName,
      });
      const deepest = report.summary.maximumDepth;

      return {
        deepest,
        headroom: limits.maximumDepth - deepest,
        limit: limits.maximumDepth,
        projectName: report.projectName,
        widest: this.widestBreadth(report),
      };
    });

    // Tightest first: a ratchet cannot descend past the top rows, and a reader scanning for
    // what to fix next should not sort fifty rows by eye. Ties fall back to the project name,
    // so the table is byte-stable between runs.
    return rows.toSorted(
      (first, second) =>
        first.headroom - second.headroom ||
        first.projectName.localeCompare(second.projectName),
    );
  }

  /** The limits one project resolved to, or the workspace's when unlisted. */
  public limitsFor(args: {
    limits: ProjectLimitsLookup;
    projectName: string;
  }): ProjectLimits {
    return args.limits.byProject.get(args.projectName) ?? args.limits.workspace;
  }

  /**
   * Counts how many projects sit in each headroom bucket. Empty buckets are still printed, since
   * 'nothing over its limit' must show.
   */
  public renderHeadroom(rows: readonly ProjectIndexRow[]): string {
    const buckets = rows.map((row) => this.bucketFor(row));

    // Counted by filtering the bucket list once per bucket. Six passes over fifty rows
    // costs nothing, and it leaves no fallback for an absent bucket, which no test could reach.
    return [
      MARKDOWN_HEADROOM_HEADER,
      ...HEADROOM_BUCKET_ORDER.map((bucket) => {
        const count = buckets.filter(
          (candidate) => candidate === bucket,
        ).length;

        return `| ${bucket} | ${String(count)} |`;
      }),
    ].join("\n");
  }

  /**
   * Renders one row per project: what it measured, and its limit as a bare number, since only one
   * origin is reachable.
   */
  public renderProjectIndex(args: RenderProjectIndexArguments): string {
    const rows = this.buildRows(args);

    if (rows.length === 0) {
      return "None.";
    }

    return [
      MARKDOWN_PROJECT_INDEX_HEADER,
      ...rows.map(
        (row) =>
          `| \`${row.projectName === "" ? ROOT_PROJECT_LABEL : row.projectName}\` | ${String(row.deepest)} | ${String(row.limit)} | ${String(row.headroom)} | ${String(row.widest)} |`,
      ),
    ].join("\n");
  }
}
