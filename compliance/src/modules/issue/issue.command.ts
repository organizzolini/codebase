import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { IssueAssigningService } from "./issue-assigning.service";
import { IssueAuditService } from "./issue-audit.service";
import { IssueLabelingService } from "./issue-labeling.service";
import { IssuePlanService } from "./issue-plan.service";
import { IssueReportService } from "./issue-report.service";

import type { IssueOutcome, IssuePlan } from "./issue.types";

/**
 * CLI command that labels, assigns, and audits issues.
 *
 * What it does follows from the workflow event and the arguments: a newly
 * opened issue gets the labels its form implies; an issue without an assignee
 * gets the owner; one issue (by number or event) or every open issue (`--all`,
 * a schedule, a dispatch) is then audited. Writes happen on workflow events,
 * or locally when `write` is passed. Every phase reports in one run; exits 1
 * if anything failed.
 */
@Command({
  arguments: "[number] [write]",
  description:
    "Label, assign, and audit one issue or, with --all, every open issue",
  name: "issue",
})
@Injectable()
export class IssueCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly issueAssigningService: IssueAssigningService,
    private readonly issueAuditService: IssueAuditService,
    private readonly issueLabelingService: IssueLabelingService,
    private readonly issuePlanService: IssuePlanService,
    private readonly issueReportService: IssueReportService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(IssueCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Labels and assigns the one issue, when writing is allowed. */
  private prepare(plan: IssuePlan): IssueOutcome[] {
    const outcomes: IssueOutcome[] = [];

    if (plan.number === undefined || !plan.writable) {
      return outcomes;
    }

    if (plan.newlyOpened) {
      outcomes.push({
        failures: [],
        lines: this.issueLabelingService.label({
          body: plan.body,
          existingLabelNames: plan.labelNames,
          issueNumber: plan.number,
        }),
      });
    }

    if (plan.needsAssignee) {
      outcomes.push(this.issueAssigningService.assign(plan.number));
    }

    return outcomes;
  }

  // 🌎 Public Methods

  /** Option parser for acting on every open issue. */
  @Option({
    description: "Assign and audit every open issue",
    flags: "-a, --all",
  })
  public parseAllOption(): boolean {
    return true;
  }

  /** Runs every phase the plan calls for and exits 1 on any failure. */
  public async run(
    passedParameters: string[],
    options?: { readonly all?: boolean },
  ): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const resolution = this.issuePlanService.resolve(
      passedParameters,
      options,
      process.env,
    );
    const plan = resolution.ok ? resolution.plan : undefined;
    const outcomes: IssueOutcome[] = resolution.ok
      ? this.prepare(resolution.plan)
      : [{ failures: [resolution.failure], lines: [resolution.failure] }];

    if (plan?.number !== undefined) {
      outcomes.push(this.issueAuditService.auditOne(plan.number));
    }

    if (plan?.allIssues && plan.writable) {
      outcomes.push(this.issueAssigningService.assignAll());
    }

    if (plan?.allIssues) {
      outcomes.push(this.issueAuditService.auditAll());
    }

    const report = this.issueReportService.compose(outcomes);

    this.issueReportService.publish(report.lines);

    if (report.failureCount > 0) {
      process.exit(1);
    }
  }
}
