import { Injectable } from "@nestjs/common";

import { PullRequestGithubService } from "./pull-request-github.service";

import type { PullRequestResult } from "./pull-request.types";

/** Finds the open descendants of the issues a pull request closes. */
@Injectable()
export class PullRequestChildIssuesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly pullRequestGithubService: PullRequestGithubService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The direct sub-issues of one issue, with whether each is still open. */
  private readChildren(
    issueNumber: number,
  ): PullRequestResult<{ number: number; open: boolean }[]> {
    const result = this.pullRequestGithubService.run([
      "api",
      "--paginate",
      `repos/{owner}/{repo}/issues/${String(issueNumber)}/sub_issues`,
      "--jq",
      String.raw`.[] | "\(.number) \(.state)"`,
    ]);

    if (!result.succeeded) {
      return {
        failure: `❌ Unable to read sub-issues of issue ${String(issueNumber)}: ${this.pullRequestGithubService.describeFailure(result)}`,
        ok: false,
      };
    }

    const children: { number: number; open: boolean }[] = [];

    for (const line of result.standardOutput.split("\n")) {
      const match = /^(?<number>[1-9]\d*) (?<state>\w+)$/u.exec(line.trim());

      if (match?.groups !== undefined) {
        children.push({
          number: Number(match.groups["number"]),
          open: match.groups["state"] === "open",
        });
      }
    }

    return { ok: true, value: children };
  }

  // 🌎 Public Methods

  /**
   * Every open descendant of the linked issues, nearest first, without
   * repeats. Closed sub-issues are still walked through but never returned.
   */
  public collect(
    linkedNumbers: readonly number[],
  ): PullRequestResult<number[]> {
    const visited = new Set<number>(linkedNumbers);
    const descendants: number[] = [];
    const queue = [...linkedNumbers];

    for (const current of queue) {
      const children = this.readChildren(current);

      if (!children.ok) {
        return children;
      }

      for (const child of children.value) {
        if (visited.has(child.number)) {
          continue;
        }

        visited.add(child.number);
        queue.push(child.number);

        if (child.open) {
          descendants.push(child.number);
        }
      }
    }

    return { ok: true, value: descendants };
  }
}
