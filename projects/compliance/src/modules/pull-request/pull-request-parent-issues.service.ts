import { Injectable } from "@nestjs/common";

import { IssueMetadataService } from "../issue/issue-metadata.service";

import { PullRequestGithubService } from "./pull-request-github.service";
import {
  issueParentSchema,
  linkedIssueNumbersSchema,
} from "./pull-request-parent-links.constants";
import { PullRequestParentLinksService } from "./pull-request-parent-links.service";

import type { PullRequestContext } from "./pull-request-context.types";
import type { LinkResult, PullRequestResult } from "./pull-request.types";

/**
 * Adds a `Related to #N` reference for every ancestor of an issue the pull
 * request closes, so the whole parent chain is linked from the description.
 */
@Injectable()
export class PullRequestParentIssuesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly issueMetadataService: IssueMetadataService,
    private readonly pullRequestGithubService: PullRequestGithubService,
    private readonly pullRequestParentLinksService: PullRequestParentLinksService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The parents above one issue, nearest first, stopping at a cycle. */
  private climb(
    start: number,
    parents: Map<number, number | undefined>,
  ): PullRequestResult<number[]> {
    const chain: number[] = [];
    let current: number | undefined = start;

    while (current !== undefined) {
      const lookup: PullRequestResult<number | undefined> = parents.has(current)
        ? { ok: true, value: parents.get(current) }
        : this.readParent(current);

      if (!lookup.ok) {
        return lookup;
      }

      parents.set(current, lookup.value);

      if (lookup.value === start || chain.includes(lookup.value ?? start)) {
        break;
      }

      if (lookup.value !== undefined) {
        chain.push(lookup.value);
      }

      current = lookup.value;
    }

    return { ok: true, value: chain };
  }

  /** Every ancestor of the linked issues, nearest first, without repeats. */
  private collectAncestors(
    linkedNumbers: readonly number[],
  ): PullRequestResult<number[]> {
    const parents = new Map<number, number | undefined>();
    const ancestors: number[] = [];

    for (const linkedNumber of linkedNumbers) {
      const chain = this.climb(linkedNumber, parents);

      if (!chain.ok) {
        return chain;
      }

      for (const parent of chain.value) {
        if (!linkedNumbers.includes(parent) && !ancestors.includes(parent)) {
          ancestors.push(parent);
        }
      }
    }

    return { ok: true, value: ancestors };
  }

  /** Runs `gh`, parses its JSON output, and says why when it cannot. */
  private readJson<Value>(
    commandArguments: readonly string[],
    parse: (document: unknown) => Value,
    description: string,
  ): PullRequestResult<Value> {
    const result = this.pullRequestGithubService.run(commandArguments);

    if (!result.succeeded) {
      return {
        failure: `❌ Unable to read ${description}: ${this.pullRequestGithubService.describeFailure(result)}`,
        ok: false,
      };
    }

    try {
      return {
        ok: true,
        value: parse(JSON.parse(result.standardOutput) as unknown),
      };
    } catch (error) {
      return {
        failure: `❌ Unable to parse ${description}: ${error instanceof Error ? error.message : String(error)}`,
        ok: false,
      };
    }
  }

  /** The parent of one issue, from GitHub's hierarchy or its body. */
  private readParent(
    issueNumber: number,
  ): PullRequestResult<number | undefined> {
    return this.readJson(
      [
        "issue",
        "view",
        String(issueNumber),
        "--json",
        "body,parent",
        "--jq",
        "{body: .body, parent: .parent}",
      ],
      (document) => {
        const issue = issueParentSchema.parse(document);

        return (
          issue.parent?.number ??
          this.issueMetadataService.extractParentIssueNumber(issue.body ?? "")
        );
      },
      `issue ${String(issueNumber)}`,
    );
  }

  /** A result that changed nothing, with whatever was said about it. */
  private unchanged(
    context: PullRequestContext,
    lines: string[],
    failures: string[] = [],
  ): LinkResult {
    return { body: context.body, outcome: { failures, lines } };
  }

  /** Adds the references to the description and writes it back if it changed. */
  private writeReferences(
    context: PullRequestContext,
    ancestors: readonly number[],
  ): LinkResult {
    let body: string;

    try {
      body = this.pullRequestParentLinksService.addRelatedIssueReferences(
        context.body,
        ancestors,
      );
    } catch (error) {
      return this.unchanged(
        context,
        [],
        [
          `❌ Unable to add parent references: ${error instanceof Error ? error.message : String(error)}`,
        ],
      );
    }

    if (body === context.body) {
      return this.unchanged(context, [
        "✅ Parent issue references are already present",
      ]);
    }

    const update = this.pullRequestGithubService.run([
      "api",
      "-X",
      "PATCH",
      `repos/{owner}/{repo}/pulls/${String(context.number)}`,
      "-f",
      `body=${body}`,
    ]);

    if (!update.succeeded) {
      return this.unchanged(
        context,
        [],
        [
          `❌ Unable to update pull request ${String(context.number)}: ${this.pullRequestGithubService.describeFailure(update)}`,
        ],
      );
    }

    return {
      body,
      outcome: {
        failures: [],
        lines: [
          `✅ Added parent issue references: ${ancestors.map((number) => `#${String(number)}`).join(", ")}`,
        ],
      },
    };
  }

  // 🌎 Public Methods

  /** Links ancestors in the description, writing it back when it changed. */
  public link(context: PullRequestContext): LinkResult {
    const linked = this.readJson(
      [
        "pr",
        "view",
        String(context.number),
        "--json",
        "closingIssuesReferences",
        "--jq",
        "[.closingIssuesReferences[].number]",
      ],
      (document) => linkedIssueNumbersSchema.parse(document),
      `issues closed by pull request ${String(context.number)}`,
    );

    if (!linked.ok) {
      return this.unchanged(context, [], [linked.failure]);
    }

    if (linked.value.length === 0) {
      return this.unchanged(context, [
        "ℹ️ No linked issues; no parent references to add",
      ]);
    }

    const ancestors = this.collectAncestors(linked.value);

    return ancestors.ok
      ? this.writeReferences(context, ancestors.value)
      : this.unchanged(context, [], [ancestors.failure]);
  }
}
