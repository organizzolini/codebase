import { appendFileSync } from "node:fs";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { PullRequestIssueGithubService } from "./pull-request-issue-github.service";
import {
  MERGE_GROUP_REF_PATTERN,
  PULL_REQUEST_NUMBER_PATTERN,
  REMEDIATION_LINES,
  STEP_SUMMARY_FAILURE_MESSAGE,
  STEP_SUMMARY_VARIABLE,
  USAGE_LINES,
} from "./pull-request-issue.constants";
import { PullRequestIssueService } from "./pull-request-issue.service";

import type { PullRequestIssuesResolution } from "./pull-request-issue.types";

/**
 * CLI command that checks a pull request closes or references an issue.
 *
 * Reads `closingIssuesReferences` live through `gh pr view`, which is GitHub's
 * own record of the link — a closing keyword in the body or the Development
 * sidebar — so a plain `Related to #N` mention does not satisfy it. A pull
 * request Dependabot opened is passed unchecked, since it writes its own body.
 * The argument is a pull request number or, in the merge queue, the group's
 * temporary ref, which carries one.
 *
 * The whole report is mirrored to `GITHUB_STEP_SUMMARY` when it is set. Exits
 * 0 when at least one issue is linked and 1 when none is or the input cannot
 * be used, and never anything else.
 */
@Command({
  description: "Check that a pull request closes or references an issue",
  name: "pull-request-issue",
})
@Injectable()
export class PullRequestIssueCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly pullRequestIssueGithubService: PullRequestIssueGithubService,
    private readonly pullRequestIssueService: PullRequestIssueService,
  ) {
    super();
    this.logger.setContext(PullRequestIssueCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Echoes one report line and keeps it for the step summary. */
  private appendToReport(reportLines: string[], reportLine: string): void {
    reportLines.push(reportLine);
    console.info(reportLine);
  }

  /** Reports one line, mirrors the report, and exits non-zero. */
  private failWithMessage(reportLines: string[], failure: string): never {
    this.appendToReport(reportLines, failure);
    this.mirrorToStepSummary(reportLines);

    return process.exit(1);
  }

  /** Reports that no issue is linked, then how to link one, and exits non-zero. */
  private failWithNoIssue(
    reportLines: string[],
    pullRequestNumber: string,
  ): never {
    this.appendToReport(
      reportLines,
      `❌ Pull request ${pullRequestNumber} closes or references no issue`,
    );
    this.appendToReport(reportLines, "");

    for (const remediationLine of REMEDIATION_LINES) {
      this.appendToReport(reportLines, remediationLine);
    }

    this.mirrorToStepSummary(reportLines);

    return process.exit(1);
  }

  /** Reports one line, then how to invoke this check, and exits non-zero. */
  private failWithUsageError(reportLines: string[], failure: string): never {
    this.appendToReport(reportLines, failure);
    this.appendToReport(reportLines, "");

    for (const usageLine of USAGE_LINES) {
      this.appendToReport(reportLines, usageLine);
    }

    this.mirrorToStepSummary(reportLines);

    return process.exit(1);
  }

  /** Mirrors the report into the GitHub Actions step summary, if there is one. */
  private mirrorToStepSummary(reportLines: readonly string[]): void {
    const summaryPath = process.env[STEP_SUMMARY_VARIABLE];

    if (summaryPath === undefined || summaryPath === "") {
      return;
    }

    if (reportLines.length === 0) {
      return;
    }

    try {
      appendFileSync(summaryPath, `${reportLines.join("\n")}\n`, "utf8");
    } catch {
      console.warn(STEP_SUMMARY_FAILURE_MESSAGE);
    }
  }

  /** Reads the pull request's closing issues live, through `gh pr view`. */
  private readLivePullRequest(
    reportLines: string[],
    pullRequestNumber: string,
  ): PullRequestIssuesResolution {
    const view = this.pullRequestIssueGithubService.run([
      "pr",
      "view",
      pullRequestNumber,
      "--json",
      "author,closingIssuesReferences",
    ]);

    if (!view.available) {
      this.failWithUsageError(
        reportLines,
        `❌ Unable to read pull request ${pullRequestNumber}: gh is not available`,
      );
    }

    if (!view.succeeded) {
      this.failWithUsageError(
        reportLines,
        `❌ Unable to read pull request ${pullRequestNumber}: gh pr view failed (${this.pullRequestIssueGithubService.describeFailure(view)})`,
      );
    }

    return this.pullRequestIssueService.resolveFromDocument(
      view.standardOutput,
    );
  }

  /**
   * The pull request number this run checks, from the argument.
   *
   * The argument is a number, or a merge queue's temporary ref with the number
   * inside it.
   */
  private resolvePullRequestNumber(
    reportLines: string[],
    passedParameters: string[],
  ): string {
    if (passedParameters.length > 1) {
      this.failWithUsageError(
        reportLines,
        "❌ Expected at most one argument, the pull request number or merge group ref",
      );
    }

    const argument = passedParameters[0];

    if (argument === undefined) {
      this.failWithUsageError(
        reportLines,
        "❌ Expected a pull request number or a merge group ref",
      );
    }

    const pullRequestNumber =
      MERGE_GROUP_REF_PATTERN.exec(argument)?.[1] ?? argument;

    if (!PULL_REQUEST_NUMBER_PATTERN.test(pullRequestNumber)) {
      this.failWithUsageError(
        reportLines,
        `❌ Not a pull request number or merge group ref: ${argument}`,
      );
    }

    return pullRequestNumber;
  }

  // 🌎 Public Methods

  /** Checks the pull request links an issue and exits 0 or 1. */
  public async run(passedParameters: string[]): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const reportLines: string[] = [];
    const pullRequestNumber = this.resolvePullRequestNumber(
      reportLines,
      passedParameters,
    );
    const resolution = this.readLivePullRequest(reportLines, pullRequestNumber);

    if (!resolution.resolved) {
      this.failWithMessage(reportLines, resolution.failure);
    }

    if (resolution.exempt) {
      this.appendToReport(
        reportLines,
        `⏭️ Pull request ${pullRequestNumber} is Dependabot's, which writes its own body: not checked`,
      );
      this.mirrorToStepSummary(reportLines);

      return;
    }

    if (resolution.issueNumbers.length === 0) {
      this.failWithNoIssue(reportLines, pullRequestNumber);
    }

    this.appendToReport(
      reportLines,
      `✅ Pull request ${pullRequestNumber} links issue(s): ${resolution.issueNumbers.map((issueNumber) => `#${issueNumber}`).join(", ")}`,
    );
    this.mirrorToStepSummary(reportLines);
  }
}
