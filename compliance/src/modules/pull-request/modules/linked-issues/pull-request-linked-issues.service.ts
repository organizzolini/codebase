import { Injectable } from "@nestjs/common";

import {
  EFFORT_FIELD,
  ISSUE_FIELD_NAMES_QUERY,
  issueFieldNamesSchema,
  PRIORITY_FIELD,
} from "../../../issue/modules/fields/issue-fields.constants";
import { IssueFieldsService } from "../../../issue/modules/fields/issue-fields.service";
import { MAX_HIERARCHY_DEPTH } from "../../../issue/modules/metadata/issue-metadata.constants";
import { IssueMetadataService } from "../../../issue/modules/metadata/issue-metadata.service";
import { issueAncestorSchema } from "../body/pull-request-body-links.constants";
import { PullRequestBodyLinksService } from "../body/pull-request-body-links.service";
import { PullRequestGithubService } from "../github/pull-request-github.service";

import {
  ISSUE_DOCUMENT_QUERY,
  NO_LINKED_ISSUE_MESSAGE,
} from "./pull-request-linked-issues.constants";

import type { IssueField } from "../../../issue/modules/fields/issue-fields.types";
import type { CheckOutcome, PullRequestResult } from "../../pull-request.types";
import type { PullRequestContext } from "../context/pull-request-context.types";
import type {
  LinkedIssue,
  LinkedIssuesRun,
} from "./pull-request-linked-issues.types";

/**
 * Judges the issues a pull request closes. Each must pass the issue audit,
 * the issue the pull request is built for must carry an Effort, and the root
 * of its hierarchy must carry a Priority.
 */
@Injectable()
export class PullRequestLinkedIssuesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly issueFieldsService: IssueFieldsService,
    private readonly issueMetadataService: IssueMetadataService,
    private readonly pullRequestBodyLinksService: PullRequestBodyLinksService,
    private readonly pullRequestGithubService: PullRequestGithubService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The shared field rule, its failure naming the issue it is about. */
  private checkField(
    issue: LinkedIssue,
    field: IssueField,
    run: LinkedIssuesRun,
  ): void {
    this.issueFieldsService.checkField(
      { fieldNames: issue.fieldNames, issueNumber: String(issue.number) },
      field,
      (failure, ...commands) => {
        run.record(this.nameIssue(issue.number, failure), ...commands);
      },
    );
  }

  /**
   * The audit failures, then the fields. A sub-issue closed beside its parent
   * is that parent's commit, so only the parent owes fields.
   */
  private checkIssue(issue: LinkedIssue, run: LinkedIssuesRun): void {
    const resolution = this.issueMetadataService.resolveFromDocument(
      issue.document,
    );

    if (!resolution.resolved) {
      run.record(resolution.failure);
      return;
    }

    const verdict = this.issueMetadataService.checkMetadata({
      formAnswers: this.issueMetadataService.parseFormAnswers(
        resolution.metadata.body,
      ),
      issueNumber: String(issue.number),
      metadata: resolution.metadata,
    });

    // The audit pairs no command with its failure, so the first carries them all.
    for (const [index, failure] of verdict.failures.entries()) {
      run.record(
        this.nameIssue(issue.number, failure),
        ...(index === 0 ? verdict.remediationCommands : []),
      );
    }

    if (
      issue.parentNumber !== undefined &&
      run.linkedNumbers.includes(issue.parentNumber)
    ) {
      return;
    }

    this.checkField(issue, EFFORT_FIELD, run);

    const root = this.findRoot(issue, run.issues);

    if (root !== undefined) {
      this.checkField(root, PRIORITY_FIELD, run);
    }
  }

  /**
   * The top of the issue's hierarchy among the issues read, never climbing
   * past its maximum depth. Undefined when an ancestor could not be read.
   */
  private findRoot(
    issue: LinkedIssue,
    issues: ReadonlyMap<number, LinkedIssue>,
  ): LinkedIssue | undefined {
    let current: LinkedIssue | undefined = issue;

    for (
      let depth = 1;
      depth < MAX_HIERARCHY_DEPTH && current?.parentNumber !== undefined;
      depth += 1
    ) {
      current = issues.get(current.parentNumber);
    }

    return current;
  }

  /** A failure about one issue, naming it after the mark. */
  private nameIssue(issueNumber: number, failure: string): string {
    return failure.replace(/^❌ /u, `❌ Issue #${String(issueNumber)}: `);
  }

  /** Runs `gh` and parses its JSON output, or says why it cannot. */
  private read<Value>(
    commandArguments: readonly string[],
    description: string,
    parse: (document: unknown) => Value,
  ): PullRequestResult<Value> {
    const result = this.pullRequestGithubService.run(commandArguments);

    if (!result.succeeded) {
      const reason = this.pullRequestGithubService.describeFailure(result);

      return {
        failure: `❌ Unable to read ${description}: ${reason}`,
        ok: false,
      };
    }

    try {
      return { ok: true, value: parse(JSON.parse(result.standardOutput)) };
    } catch (error) {
      const reason = this.issueMetadataService.describeError(error);

      return {
        failure: `❌ Unable to parse ${description}: ${reason}`,
        ok: false,
      };
    }
  }

  /**
   * Reads every closed issue and each ancestor above it, once each, bounded
   * so a parent cycle cannot run away.
   */
  private readHierarchy(run: LinkedIssuesRun): void {
    const pending = [...run.linkedNumbers];
    const bound = run.linkedNumbers.length * MAX_HIERARCHY_DEPTH;

    for (const issueNumber of pending) {
      const issue = run.issues.has(issueNumber)
        ? undefined
        : this.readIssue(issueNumber);

      if (issue?.ok === false) {
        run.record(issue.failure);
      } else if (issue?.ok === true) {
        run.issues.set(issueNumber, issue.value);

        if (issue.value.parentNumber !== undefined && pending.length < bound) {
          pending.push(issue.value.parentNumber);
        }
      }
    }
  }

  /** One issue's document, parent, and filled issue fields, all through REST. */
  private readIssue(issueNumber: number): PullRequestResult<LinkedIssue> {
    const name = `issue #${String(issueNumber)}`;
    const view = this.read(
      [
        "api",
        `repos/{owner}/{repo}/issues/${String(issueNumber)}`,
        "--jq",
        ISSUE_DOCUMENT_QUERY,
      ],
      name,
      (document) => ({ ...issueAncestorSchema.parse(document), document }),
    );
    const fields = this.read(
      [
        "api",
        `repos/{owner}/{repo}/issues/${String(issueNumber)}`,
        "--jq",
        ISSUE_FIELD_NAMES_QUERY,
      ],
      `the issue fields of ${name}`,
      (document) => issueFieldNamesSchema.parse(document),
    );

    if (!view.ok) {
      return view;
    }

    if (!fields.ok) {
      return fields;
    }

    const parentNumber =
      view.value.parent?.number ??
      this.issueMetadataService.extractParentIssueNumber(view.value.body ?? "");

    return {
      ok: true,
      value: {
        document: JSON.stringify(view.value.document),
        fieldNames: fields.value,
        number: issueNumber,
        ...(parentNumber === undefined ? {} : { parentNumber }),
      },
    };
  }

  // 🌎 Public Methods

  /**
   * A pull request must close at least one issue, and every one must be
   * compliant.
   */
  public check(context: PullRequestContext): CheckOutcome {
    const base = {
      heading: "❌ Pull request is not linked to a compliant issue",
      successMessage: "✅ Pull request closes compliant issues",
    };
    const linkedNumbers =
      this.pullRequestBodyLinksService.extractClosingIssueNumbers(context.body);

    if (linkedNumbers.length === 0) {
      return {
        ...base,
        failures: [NO_LINKED_ISSUE_MESSAGE],
        remediationCommands: [],
      };
    }

    const failures = new Set<string>();
    const remediationCommands = new Set<string>();
    const run: LinkedIssuesRun = {
      issues: new Map(),
      linkedNumbers,
      record: (failure, ...commands) => {
        failures.add(failure);
        for (const command of commands) {
          remediationCommands.add(command);
        }
      },
    };

    this.readHierarchy(run);

    for (const issue of linkedNumbers.map((number) => run.issues.get(number))) {
      if (issue !== undefined) {
        this.checkIssue(issue, run);
      }
    }

    return {
      ...base,
      failures: [...failures],
      remediationCommands: [...remediationCommands],
    };
  }
}
