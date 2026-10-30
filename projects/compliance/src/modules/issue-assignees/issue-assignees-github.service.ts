import { spawnSync } from "node:child_process";

import { Injectable } from "@nestjs/common";

import {
  DEFAULT_ISSUE_ASSIGNEE,
  GITHUB_CLI_BINARY,
  OPEN_ISSUES_ENDPOINT,
  OPEN_ISSUES_QUERY,
  openIssueSummariesSchema,
} from "./issue-assignees.constants";

import type {
  GithubCliResult,
  ListUnassignedOpenIssueNumbersResult,
} from "./issue-assignees.types";

/** Reads open issues and assigns them through the GitHub CLI. */
@Injectable()
export class IssueAssigneesGithubService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

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

  /** Describes the output of a failed `gh` invocation. */
  public describeFailure(result: GithubCliResult): string {
    const output = [result.standardError, result.standardOutput.trim()]
      .filter((part) => part !== "")
      .join(" ");

    return output === "" ? "no output" : output;
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

  /** Invokes `gh` with these arguments, capturing both streams. */
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
