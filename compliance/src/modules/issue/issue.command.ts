import { setTimeout } from "node:timers/promises";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { IssueReportService } from "./issue-report.service";
import { ISSUE_AUDIT_RETRY_DELAY_MS } from "./issue.constants";
import { IssueAssigningService } from "./modules/assignees/issue-assigning.service";
import { IssueAuditService } from "./modules/audit/issue-audit.service";
import { IssuePlanService } from "./modules/audit/issue-plan.service";
import { IssueLabelingService } from "./modules/labels/issue-labeling.service";

import type { IssueOutcome, IssuePlan } from "./issue.types";

/**
 * CLI command that labels, assigns, and audits issues.
 *
 * A newly opened issue gets the labels its form implies and, if unassigned, the
 * owner. One issue, or every open issue with `--all`, is then audited. Writes happen
 * on workflow events, or locally with `write`. Exits 1 if anything failed.
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

  /**
   * Audits one issue, and a newly opened one a second time if it failed.
   *
   * Its author often adds the scope label just after filing it.
   */
  private async auditOne(
    issueNumber: string,
    newlyOpened: boolean,
  ): Promise<IssueOutcome> {
    const outcome = this.issueAuditService.auditOne(issueNumber);

    if (!newlyOpened || outcome.failures.length === 0) {
      return outcome;
    }

    await setTimeout(ISSUE_AUDIT_RETRY_DELAY_MS);

    return this.issueAuditService.auditOne(issueNumber);
  }

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
      outcomes.push(await this.auditOne(plan.number, plan.newlyOpened));
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
