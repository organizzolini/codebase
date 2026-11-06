import { Injectable } from "@nestjs/common";

import { IssueMetadataService } from "../issue/issue-metadata.service";

import {
  ISSUE_REFERENCE_PATTERN,
  issueAncestorSchema,
  linkedIssueNumbersSchema,
  MANUAL_REFERENCE_LIMIT,
} from "./pull-request-body-links.constants";
import { PullRequestBodyLinksService } from "./pull-request-body-links.service";
import { PullRequestClosingReferencesService } from "./pull-request-closing-references.service";
import { PullRequestDescendantIssuesService } from "./pull-request-descendant-issues.service";
import { PullRequestGithubService } from "./pull-request-github.service";
import { DEPENDABOT_LOGIN } from "./pull-request.constants";

import type { PullRequestContext } from "./pull-request-context.types";
import type {
  CheckOutcome,
  LinkResult,
  PullRequestResult,
} from "./pull-request.types";

/**
 * Links the whole issue hierarchy from a pull request description: a
 * `Related to #N` line for every ancestor of an issue the pull request closes
 * and a `Closes #N` line for every open descendant, so merging closes the
 * entire subtree.
 */
@Injectable()
export class PullRequestAncestorIssuesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly issueMetadataService: IssueMetadataService,
    private readonly pullRequestDescendantIssuesService: PullRequestDescendantIssuesService,
    private readonly pullRequestGithubService: PullRequestGithubService,
    private readonly pullRequestBodyLinksService: PullRequestBodyLinksService,
    private readonly pullRequestClosingReferencesService: PullRequestClosingReferencesService,
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

  /** Renders issue numbers as `#1, #2`. */
  private format(numbers: readonly number[]): string {
    return numbers.map((number) => `#${String(number)}`).join(", ");
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

  /** The issues GitHub lists as closed by the pull request. */
  private readLinked(number: number): PullRequestResult<number[]> {
    return this.readJson(
      [
        "pr",
        "view",
        String(number),
        "--json",
        "closingIssuesReferences",
        "--jq",
        "[.closingIssuesReferences[].number]",
      ],
      (document) => linkedIssueNumbersSchema.parse(document),
      `issues closed by pull request ${String(number)}`,
    );
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
        const issue = issueAncestorSchema.parse(document);

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
    descendants: readonly number[],
  ): LinkResult {
    let body: string;

    try {
      body = this.pullRequestBodyLinksService.addRelatedIssueReferences(
        context.body,
        ancestors,
      );

      if (descendants.length > 0) {
        body = this.pullRequestBodyLinksService.addRelatedIssueReferences(
          body,
          descendants,
          "Closes",
        );
      }
    } catch (error) {
      return this.unchanged(
        context,
        [],
        [
          `❌ Unable to add ancestor references: ${error instanceof Error ? error.message : String(error)}`,
        ],
      );
    }

    if (body === context.body) {
      return this.unchanged(context, [
        "✅ Ancestor issue references are already present",
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
          ...(ancestors.length > 0
            ? [`✅ Added ancestor issue references: ${this.format(ancestors)}`]
            : []),
          ...(descendants.length > 0
            ? [
                `✅ Added closing descendant issue references: ${this.format(descendants)}`,
              ]
            : []),
        ],
      },
    };
  }

  // 🌎 Public Methods

  /** Links ancestors in the description, writing it back when it changed. */
  public link(context: PullRequestContext): LinkResult {
    const linked = this.readLinked(context.number);

    if (!linked.ok) {
      return this.unchanged(context, [], [linked.failure]);
    }

    if (linked.value.length === 0) {
      return this.unchanged(context, [
        "ℹ️ No linked issues; no ancestor references to add",
      ]);
    }

    const ancestors = this.collectAncestors(linked.value);

    if (!ancestors.ok) {
      return this.unchanged(context, [], [ancestors.failure]);
    }

    const descendants = this.pullRequestDescendantIssuesService.collect(
      linked.value,
    );

    if (!descendants.ok) {
      return this.unchanged(context, [], [descendants.failure]);
    }

    const closable = descendants.value.filter(
      (number) => !ancestors.value.includes(number),
    );
    const written = this.writeReferences(context, ancestors.value, closable);
    const closing = this.pullRequestClosingReferencesService.close(
      context.number,
      closable
        .filter((number) => !linked.value.includes(number))
        .slice(0, Math.max(0, MANUAL_REFERENCE_LIMIT - linked.value.length)),
    );

    return {
      body: written.body,
      outcome: {
        failures: [...written.outcome.failures, ...closing.failures],
        lines: [...written.outcome.lines, ...closing.lines],
      },
    };
  }

  /**
   * Judges the links the write phase makes: every open descendant of a closed
   * issue must be a real closing reference, and every ancestor must be named
   * in the description. GitHub allows ten manual closing references, so once
   * a pull request holds ten, a `Closes` line in the description stands in
   * for the rest. Draft and Dependabot pull requests are exempt, like
   * the linked-issue check.
   */
  public verify(context: PullRequestContext): CheckOutcome {
    const base = {
      heading: "❌ Pull request does not link its issue hierarchy",
      remediationCommands: [
        `compliance pull-request ${String(context.number)} write`,
      ],
      successMessage: "✅ Pull request links its issue hierarchy",
    };
    const linked = this.readLinked(context.number);

    if (context.draft || context.author === DEPENDABOT_LOGIN) {
      return { ...base, failures: [] };
    }

    if (!linked.ok) {
      return { ...base, failures: [linked.failure] };
    }

    const ancestors = this.collectAncestors(linked.value);
    const descendants = this.pullRequestDescendantIssuesService.collect(
      linked.value,
    );

    if (!ancestors.ok || !descendants.ok) {
      return {
        ...base,
        failures: [
          ancestors.ok ? "" : ancestors.failure,
          descendants.ok ? "" : descendants.failure,
        ].filter((failure) => failure !== ""),
      };
    }

    const mentioned = new Set(
      [...context.body.matchAll(ISSUE_REFERENCE_PATTERN)].map((match) =>
        Number(match.groups?.["issueNumber"]),
      ),
    );
    const capped = linked.value.length >= MANUAL_REFERENCE_LIMIT;
    const unclosed = descendants.value.filter(
      (number) =>
        !linked.value.includes(number) &&
        !ancestors.value.includes(number) &&
        !(capped && mentioned.has(number)),
    );
    const unrelated = ancestors.value.filter(
      (number) => !mentioned.has(number),
    );

    return {
      ...base,
      failures: [
        ...(unclosed.length === 0
          ? []
          : [
              `❌ Open descendant issues are not closed by this pull request: ${this.format(unclosed)}`,
            ]),
        ...(unrelated.length === 0
          ? []
          : [
              `❌ Ancestor issues are not referenced in the description: ${this.format(unrelated)}`,
            ]),
      ],
    };
  }
}
