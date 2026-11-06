import { Injectable } from "@nestjs/common";

import { CLOSE_ISSUE_REFERENCES_MUTATION } from "./pull-request-closing-references.constants";
import { PullRequestGithubService } from "./pull-request-github.service";

import type { PullRequestResult, WriteOutcome } from "./pull-request.types";

/** Links issues to a pull request in GitHub's Development sidebar. */
@Injectable()
export class PullRequestClosingReferencesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly pullRequestGithubService: PullRequestGithubService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Links one issue, or says why it could not. */
  private linkIssue(pullRequestId: string, number: number): string | undefined {
    const issue = this.readNodeId("issue", number);

    if (!issue.ok) {
      return issue.failure;
    }

    const result = this.pullRequestGithubService.run([
      "api",
      "graphql",
      "-f",
      `query=${CLOSE_ISSUE_REFERENCES_MUTATION}`,
      "-f",
      `pullRequest=${pullRequestId}`,
      "-f",
      `issue=${issue.value}`,
    ]);

    return result.succeeded
      ? undefined
      : `❌ Unable to link issue ${String(number)}: ${this.pullRequestGithubService.describeFailure(result)}`;
  }

  /** The GraphQL node id of a pull request or an issue. */
  private readNodeId(
    kind: "issue" | "pr",
    number: number,
  ): PullRequestResult<string> {
    const result = this.pullRequestGithubService.run([
      kind,
      "view",
      String(number),
      "--json",
      "id",
      "--jq",
      ".id",
    ]);
    const identifier = result.standardOutput.trim();

    return result.succeeded && identifier !== ""
      ? { ok: true, value: identifier }
      : {
          failure: `❌ Unable to read the id of ${kind === "pr" ? "pull request" : "issue"} ${String(number)}: ${this.pullRequestGithubService.describeFailure(result)}`,
          ok: false,
        };
  }

  // 🌎 Public Methods

  /** Makes each issue a real closing reference of the pull request. */
  public close(
    pullRequestNumber: number,
    issueNumbers: readonly number[],
  ): WriteOutcome {
    if (issueNumbers.length === 0) {
      return { failures: [], lines: [] };
    }

    const pullRequest = this.readNodeId("pr", pullRequestNumber);

    if (!pullRequest.ok) {
      return { failures: [pullRequest.failure], lines: [] };
    }

    const failures: string[] = [];
    const lines: string[] = [];

    for (const number of issueNumbers) {
      const failure = this.linkIssue(pullRequest.value, number);

      if (failure === undefined) {
        lines.push(`✅ Linked closing issue #${String(number)}`);
      } else {
        failures.push(failure);
      }
    }

    return { failures, lines };
  }
}
