import { Injectable } from "@nestjs/common";

import { DEFAULT_ISSUE_ASSIGNEE } from "./issue-assignees.constants";
import { IssueGithubService } from "./issue-github.service";

import type { IssueOutcome } from "./issue.types";

/** Assigns the repository owner to issues that have nobody. */
@Injectable()
export class IssueAssigningService {
  // 🏗 Dependency Injection

  constructor(private readonly issueGithubService: IssueGithubService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Assigns the owner to one issue. */
  public assign(issueNumber: string): IssueOutcome {
    const result = this.issueGithubService.assignIssue(issueNumber);

    if (result.succeeded) {
      return {
        failures: [],
        lines: [
          `✅ Assigned issue ${issueNumber} to ${DEFAULT_ISSUE_ASSIGNEE}`,
        ],
      };
    }

    const failure = `❌ Unable to assign issue ${issueNumber}: ${this.issueGithubService.describeFailure(result)}`;

    return { failures: [failure], lines: [failure] };
  }

  /** Assigns the owner to every unassigned open issue, pull requests aside. */
  public assignAll(): IssueOutcome {
    const listing = this.issueGithubService.listUnassignedOpenIssueNumbers();

    if (!listing.success) {
      const failure = `❌ Unable to list open issues: ${listing.error}`;

      return { failures: [failure], lines: [failure] };
    }

    const outcomes = listing.issueNumbers.map((issueNumber) =>
      this.assign(String(issueNumber)),
    );

    return {
      failures: outcomes.flatMap((outcome) => outcome.failures),
      lines:
        listing.issueNumbers.length === 0
          ? ["✅ No unassigned open issues found"]
          : [
              ...outcomes.flatMap((outcome) => outcome.lines),
              `✅ Assigned ${String(listing.issueNumbers.length)} unassigned open issue(s)`,
            ],
    };
  }
}
