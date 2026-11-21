import { spawnSync } from "node:child_process";

import { Injectable } from "@nestjs/common";

import {
  DEFAULT_ISSUE_ASSIGNEE,
  OPEN_ISSUES_ENDPOINT,
  OPEN_ISSUES_QUERY,
  openIssueSummariesSchema,
} from "../assignees/issue-assignees.constants";
import {
  ISSUE_FIELD_NAMES_QUERY,
  issueFieldNamesSchema,
  OPEN_ISSUE_FIELDS_QUERY,
  openIssueFieldsSchema,
} from "../fields/issue-fields.constants";
import { GITHUB_CLI_BINARY } from "../metadata/issue-metadata.constants";

import type { ListUnassignedOpenIssueNumbersResult } from "../assignees/issue-assignees.types";
import type {
  IssueFieldNamesResult,
  OpenIssueFieldNamesResult,
} from "../fields/issue-fields.types";
import type {
  GithubCliResult,
  IssueSummary,
  ListIssuesResult,
} from "../metadata/issue-metadata.types";

/**
 * Runs the `gh` command-line client and reports what it produced.
 *
 * Uses `gh` rather than an HTTP client: it resolves the repository and token
 * from the checkout, so every caller authenticates alike.
 *
 * Nothing here throws. A missing or rate-limited `gh` is reported, not raised.
 */
@Injectable()
export class IssueGithubService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whatever was thrown, as the one line a result can carry. */
  private describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /** Every open issue's filled field names, from the paginated REST listing. */
  private listOpenIssueFieldNames(): OpenIssueFieldNamesResult {
    const result = this.run([
      "api",
      "--paginate",
      OPEN_ISSUES_ENDPOINT,
      "--jq",
      OPEN_ISSUE_FIELDS_QUERY,
    ]);

    if (!result.succeeded) {
      return { error: this.describeFailure(result), success: false };
    }

    try {
      const lines = result.standardOutput.split("\n").filter(Boolean);
      const entries = lines.map((line) =>
        openIssueFieldsSchema.parse(JSON.parse(line)),
      );

      return {
        fieldNames: new Map(
          entries.map((entry) => [entry.number, entry.fieldNames]),
        ),
        success: true,
      };
    } catch (error) {
      return {
        error: `Unable to parse the open issue fields: ${this.describeError(error)}`,
        success: false,
      };
    }
  }

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

  /** Lists all open issues with their number, title, body, labels, and fields. */
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

    let issues: IssueSummary[];

    try {
      issues = JSON.parse(result.standardOutput) as IssueSummary[];
    } catch (error) {
      return {
        error: `Unable to parse gh issue list output: ${this.describeError(error)}`,
        success: false,
      };
    }

    const fields = this.listOpenIssueFieldNames();

    if (!fields.success) {
      return { error: fields.error, success: false };
    }

    return {
      issues: issues.map((issue) => {
        const fieldNames = fields.fieldNames.get(issue.number);

        return fieldNames === undefined ? issue : { ...issue, fieldNames };
      }),
      success: true,
    };
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

  /** The names of the issue fields one issue has a value for. */
  public readFieldNames(issueNumber: string): IssueFieldNamesResult {
    const result = this.run([
      "api",
      `repos/{owner}/{repo}/issues/${issueNumber}`,
      "--jq",
      ISSUE_FIELD_NAMES_QUERY,
    ]);

    if (!result.succeeded) {
      return { error: this.describeFailure(result), success: false };
    }

    try {
      return {
        fieldNames: issueFieldNamesSchema.parse(
          JSON.parse(result.standardOutput),
        ),
        success: true,
      };
    } catch (error) {
      return {
        error: `Unable to parse the issue fields: ${this.describeError(error)}`,
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
