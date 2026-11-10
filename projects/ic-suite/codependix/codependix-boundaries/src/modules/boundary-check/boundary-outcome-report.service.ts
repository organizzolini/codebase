import { Injectable } from "@nestjs/common";

import { BoundaryReportService } from "../boundaries/boundary-report.service";

import {
  CONTINUATION_INDENT,
  WORKSPACE_GROUP_HEADING,
} from "./boundary-check.constants";

import type {
  BoundaryCheckFailure,
  BoundaryReport,
  BoundaryReportArguments,
  BoundaryReportFailure,
  BoundaryReportViolation,
  JudgedBoundaryFinding,
} from "./boundary-check.types";

/**
 * Reports what a boundary pass found: as lines, as the JSON `boundaries` object, and as a Markdown
 * section. Kept apart from `BoundaryReportService`, which only renders rule violations. Charge
 * wording still comes from `BoundaryReportService.describeCharge`.
 */
@Injectable()
export class BoundaryOutcomeReportService {
  // 🏗 Dependency Injection

  constructor(private readonly boundaryReportService: BoundaryReportService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Every failure of a report that is charged to some projects, not all. */
  private findProjectFailures(
    report: BoundaryReport,
  ): readonly BoundaryReportFailure[] {
    return report.failures.filter(
      (failure) => !this.isWorkspaceWide(failure, report),
    );
  }

  /** Every failure of a report charged to every project it judged. */
  private findWorkspaceFailures(
    report: BoundaryReport,
  ): readonly BoundaryReportFailure[] {
    return report.failures.filter((failure) =>
      this.isWorkspaceWide(failure, report),
    );
  }

  /** Whether a failure is charged to every project a report judged. */
  private isWorkspaceWide(
    failure: Pick<BoundaryReportFailure, "projects">,
    report: BoundaryReport,
  ): boolean {
    return this.boundaryReportService.isChargedToEveryProject({
      judgedProjects: report.judgedProjects,
      projects: failure.projects,
    });
  }

  /**
   * One bullet: bold verdict, then the line. Continuation lines are indented, and `-->` is escaped
   * so it cannot close an HTML comment.
   */
  private renderBullet(verdict: string, line: string): string {
    const text = line
      .replaceAll(/\r\n?/g, "\n")
      .replaceAll("-->", "--&gt;")
      .split("\n")
      .map((part, index) =>
        index === 0 || part === "" ? part : `${CONTINUATION_INDENT}${part}`,
      )
      .join("\n");

    return `- **${verdict}** ${text}`;
  }

  /**
   * One failure as its log line, naming the project owning the code it broke on, when that is another project.
   */
  private renderFailure(args: {
    failure: JudgedBoundaryFinding<BoundaryCheckFailure>;
    judgedProjects: readonly string[];
  }): string {
    const { failure, judgedProjects } = args;
    const owner =
      failure.ownerProject === undefined
        ? ""
        : ` (failed in code owned by ${failure.ownerProject})`;

    return this.boundaryReportService.renderViolation({
      isNote: failure.verdict === "note",
      judgedProjects,
      violation: {
        level: failure.level,
        message: `${failure.error}${owner}`,
        projects: failure.projects,
      },
    });
  }

  /**
   * The bullets of every finding charged to one project, violations first. Workspace-wide failures
   * are left to `renderWorkspaceGroup`.
   */
  private renderProjectGroup(args: {
    project: string;
    report: BoundaryReport;
  }): string {
    const { project, report } = args;
    const bullets = [
      ...report.violations
        .filter((violation) => violation.projects.includes(project))
        .map((violation) =>
          this.renderBullet(violation.verdict, this.renderViolation(violation)),
        ),
      ...this.findProjectFailures(report)
        .filter((failure) => failure.projects.includes(project))
        .map((failure) =>
          this.renderBullet(
            failure.verdict,
            this.renderFailure({
              failure,
              judgedProjects: report.judgedProjects,
            }),
          ),
        ),
    ];

    return [`#### ${project}`, "", ...bullets].join("\n");
  }

  /** One violation as the line the log and the Markdown report both print. */
  private renderViolation(
    violation: Pick<
      BoundaryReportViolation,
      "level" | "message" | "projects" | "verdict"
    >,
  ): string {
    return this.boundaryReportService.renderViolation({
      isNote: violation.verdict === "note",
      violation,
    });
  }

  /**
   * The one group holding every failure charged to every judged project, in
   * place of the same bullet under each of them.
   */
  private renderWorkspaceGroup(report: BoundaryReport): string {
    const bullets = this.findWorkspaceFailures(report).map((failure) =>
      this.renderBullet(
        failure.verdict,
        this.renderFailure({ failure, judgedProjects: report.judgedProjects }),
      ),
    );

    return [`#### ${WORKSPACE_GROUP_HEADING}`, "", ...bullets].join("\n");
  }

  // 🌎 Public Methods

  /**
   * Reduces a pass's findings to the `--format json` object. Maps field by field: `scope` is
   * dropped, since `projects` names the owners.
   */
  buildReport(args: BoundaryReportArguments): BoundaryReport {
    return {
      failures: args.outcome.failures.map((failure): BoundaryReportFailure => ({
        error: failure.error,
        level: failure.level,
        ...(failure.ownerProject !== undefined && {
          ownerProject: failure.ownerProject,
        }),
        projects: failure.projects,
        verdict: failure.verdict,
      })),
      judgedProjects: [...args.judgedProjects].toSorted(),
      violations: args.outcome.violations.map(
        (violation): BoundaryReportViolation => ({
          cycle: violation.cycle ?? null,
          level: violation.level,
          message: violation.message,
          projects: violation.projects,
          rule: violation.rule,
          source: violation.source,
          target: violation.target,
          verdict: violation.verdict,
        }),
      ),
    };
  }

  /**
   * One line per failure, with its level, charge, and error. Notes name their dependency.
   */
  renderFailures(
    failures: readonly JudgedBoundaryFinding<BoundaryCheckFailure>[],
    judgedProjects: readonly string[],
  ): string[] {
    return failures.map((failure) =>
      this.renderFailure({ failure, judgedProjects }),
    );
  }

  /**
   * Renders a report as Markdown: findings under each charged project, workspace-wide failures once,
   * first. No judged project prints as "none".
   */
  renderMarkdown(report: BoundaryReport): string {
    const judged = `Judged projects: ${
      report.judgedProjects.length === 0
        ? "none"
        : report.judgedProjects.join(", ")
    }.`;
    const workspaceFailures = this.findWorkspaceFailures(report);
    const charged = [
      ...new Set([
        ...report.violations.flatMap((violation) => violation.projects),
        ...this.findProjectFailures(report).flatMap(
          (failure) => failure.projects,
        ),
      ]),
    ].toSorted();

    if (charged.length === 0 && workspaceFailures.length === 0) {
      return `${judged}\n\nNo boundary findings.`;
    }

    return [
      judged,
      ...(workspaceFailures.length === 0
        ? []
        : [this.renderWorkspaceGroup(report)]),
      ...charged.map((project) => this.renderProjectGroup({ project, report })),
    ].join("\n\n");
  }
}
