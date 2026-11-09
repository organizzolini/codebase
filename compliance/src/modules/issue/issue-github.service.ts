import { spawnSync } from "node:child_process";

import { Injectable } from "@nestjs/common";

import {
  DEFAULT_ISSUE_ASSIGNEE,
  OPEN_ISSUES_ENDPOINT,
  OPEN_ISSUES_QUERY,
  openIssueSummariesSchema,
} from "./issue-assignees.constants";
import { GITHUB_CLI_BINARY } from "./issue-metadata.constants";

import type { ListUnassignedOpenIssueNumbersResult } from "./issue-assignees.types";
import type {
  GithubCliResult,
  IssueSummary,
  ListIssuesResult,
} from "./issue-metadata.types";

/**
 * Runs the `gh` command-line client and reports what it produced.
 *
 * The `gh` client rather than an HTTP client on purpose: it already resolves
 * the repository and token from the checkout and environment, so every caller
 * authenticates the same way with nothing to configure.
 *
 * Nothing here throws. A missing, unauthorized, or rate-limited `gh` is a fact
 * to report, not an exception to propagate.
 */
@Injectable()
export class IssueGithubService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Adds one label to one issue. */
  public addLabel(issueNumber: string, label: string): GithubCliResult {
    return this.run(["issue", "edit", issueNumber, "--add-label", label]);
  }

  /** Assigns the configured repository owner to one issue. */
  public assignIssue(issueNumber: string): GithubCliResult {
    return this.run([
      "issue",
      "edit",
      issueNumber,
      "--add-assignee",
      DEFAULT_ISSUE_ASSIGNEE,
    ]);
  }

  /**
   * Whatever `gh` said about why it could not do the thing.
   *
   * Both streams, since `gh` varies which one carries the reason.
   */
  public describeFailure(result: GithubCliResult): string {
    const output = [result.standardError, result.standardOutput.trim()]
      .filter((part) => part !== "")
      .join(" ");

    return output === "" ? "no output" : output;
  }

  /** Whether the `gh` binary can be executed at all. */
  public isAvailable(): boolean {
    return this.run(["--version"]).available;
  }

  /** Lists all open issues with their number, title, body, and labels. */
  public listOpenIssues(): ListIssuesResult {
    const result = this.run([
      "issue",
      "list",
      "--state",
      "open",
      "--limit",
      "500",
      "--json",
      "number,title,body,labels,issueType,parent",
    ]);

    if (!result.succeeded) {
      return { error: this.describeFailure(result), success: false };
    }

    try {
      const issues = JSON.parse(result.standardOutput) as IssueSummary[];
      return { issues, success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        error: `Unable to parse gh issue list output: ${message}`,
        success: false,
      };
    }
  }

  /** Lists unassigned issues from every open issues page, excluding PRs. */
  public listUnassignedOpenIssueNumbers(): ListUnassignedOpenIssueNumbersResult {
    const result = this.run([
      "api",
      "--paginate",
      "--slurp",
      OPEN_ISSUES_ENDPOINT,
      "--jq",
      OPEN_ISSUES_QUERY,
    ]);

    if (!result.succeeded) {
      return { error: this.describeFailure(result), success: false };
    }

    try {
      const issues = openIssueSummariesSchema.parse(
        JSON.parse(result.standardOutput) as unknown,
      );

      return {
        issueNumbers: issues
          .filter(
            (issue) =>
              (issue.pull_request === null ||
                issue.pull_request === undefined) &&
              issue.assignees.length === 0,
          )
          .map((issue) => issue.number),
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        error: `Unable to parse gh api output: ${message}`,
        success: false,
      };
    }
  }

  /** Invokes `gh` with these arguments, capturing each stream on its own. */
  public run(commandArguments: readonly string[]): GithubCliResult {
    const completion = spawnSync(GITHUB_CLI_BINARY, [...commandArguments], {
      encoding: "utf8",
    });

    if (completion.error !== undefined) {
      return {
        available: false,
        standardError: completion.error.message,
        standardOutput: "",
        succeeded: false,
      };
    }

    return {
      available: true,
      standardError: completion.stderr.trim(),
      standardOutput: completion.stdout,
      succeeded: completion.status === 0,
    };
  }
}
