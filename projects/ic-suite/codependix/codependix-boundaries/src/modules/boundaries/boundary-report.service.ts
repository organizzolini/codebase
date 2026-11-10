import { Injectable } from "@nestjs/common";

import type { BoundaryViolation } from "./boundaries.types";

/**
 * Renders violations into the lines a run prints, since this package knows what a finding means.
 * A report is a list of current problems, not a document, so it is never regenerated or checked for staleness.
 */
@Injectable()
export class BoundaryReportService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Words who a finding is charged to. Notes say "in dependency"; a failure charged to every
   * judged project is counted, not listed.
   */
  public describeCharge(args: {
    isNote: boolean;
    judgedProjects?: readonly string[];
    projects: readonly string[];
  }): string {
    if (args.isNote) {
      return `in dependency ${args.projects.join(", ")}, not failing`;
    }

    return args.judgedProjects !== undefined &&
      this.isChargedToEveryProject({
        judgedProjects: args.judgedProjects,
        projects: args.projects,
      })
      ? `all ${args.projects.length} judged projects`
      : args.projects.join(", ");
  }

  /**
   * Whether a charge names every one of several judged projects, compared as sets.
   * One judged project is never "all".
   */
  public isChargedToEveryProject(args: {
    judgedProjects: readonly string[];
    projects: readonly string[];
  }): boolean {
    const charged = new Set(args.projects);

    return (
      charged.size > 1 &&
      charged.size === new Set(args.judgedProjects).size &&
      args.judgedProjects.every((project) => charged.has(project))
    );
  }

  /**
   * One line per note — a violation charged only to a dependency of the
   * projects a run judges — marked as not failing.
   */
  public renderNotes(violations: readonly BoundaryViolation[]): string[] {
    return violations.map((violation) =>
      this.renderViolation({ isNote: true, violation }),
    );
  }

  /**
   * One summary line for a run. Counts rules as well as violations: one rule with forty edges is one decision.
   */
  public renderSummary(violations: readonly BoundaryViolation[]): string {
    if (violations.length === 0) {
      return "No boundary violations.";
    }

    const rules = new Set(violations.map((violation) => violation.rule));
    const edges = violations.length === 1 ? "violation" : "violations";
    const named = rules.size === 1 ? "rule" : "rules";

    return `${violations.length} boundary ${edges} across ${rules.size} ${named}.`;
  }

  /**
   * One violation's log and Markdown line: level, charged projects, message. Defined once so they cannot drift apart.
   */
  public renderViolation(args: {
    isNote: boolean;
    judgedProjects?: readonly string[];
    violation: Pick<BoundaryViolation, "level" | "message" | "projects">;
  }): string {
    const { isNote, judgedProjects, violation } = args;
    const charge = this.describeCharge({
      isNote,
      ...(judgedProjects !== undefined && { judgedProjects }),
      projects: violation.projects,
    });

    return `${violation.level} ${charge}: ${violation.message}`;
  }

  /**
   * One line per violation: its level and the projects it is charged to, not the workspace.
   */
  public renderViolations(violations: readonly BoundaryViolation[]): string[] {
    return violations.map((violation) =>
      this.renderViolation({ isNote: false, violation }),
    );
  }
}
