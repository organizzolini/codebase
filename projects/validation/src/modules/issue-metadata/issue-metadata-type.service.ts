import { Injectable } from "@nestjs/common";

import {
  PARENT_ISSUE_PATTERN,
  ROOT_ISSUE_TYPES,
  SUB_ISSUE_TYPE,
} from "./issue-metadata.constants";

import type { IssueSummary, IssueTypeFacts } from "./issue-metadata.types";

/**
 * Judges an issue's GitHub Issue Type against its place in the hierarchy.
 *
 * A root issue, with no parent, is a Feature or a Bug. Every sub-issue, at any
 * depth, is a Task. The type is read from GitHub's native `issueType` and
 * `parent` fields, with a `Part of #n` line in the body counting as a parent
 * for an issue that has not been linked natively yet.
 */
@Injectable()
export class IssueMetadataTypeService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** A root issue is a Feature or a Bug. */
  private checkRoot(
    issueNumber: string,
    issueType: null | string,
    record: (failure: string, ...commands: string[]) => void,
  ): void {
    if (issueType !== null && ROOT_ISSUE_TYPES.includes(issueType)) {
      return;
    }

    record(
      `❌ A root issue must have the ${ROOT_ISSUE_TYPES.join(" or ")} issue type (found: ${issueType ?? "none"})`,
      ...ROOT_ISSUE_TYPES.map(
        (type) => `gh issue edit ${issueNumber} --type ${type}`,
      ),
    );
  }

  /** Every sub-issue is a Task. */
  private checkSubIssue(
    issueNumber: string,
    issueType: null | string,
    record: (failure: string, ...commands: string[]) => void,
  ): void {
    if (issueType === SUB_ISSUE_TYPE) {
      return;
    }

    record(
      `❌ A sub-issue must have the ${SUB_ISSUE_TYPE} issue type (found: ${issueType ?? "none"})`,
      `gh issue edit ${issueNumber} --type ${SUB_ISSUE_TYPE}`,
    );
  }

  /** Whether the body links a parent the native field has not caught up to. */
  private hasBodyParent(body: string): boolean {
    return PARENT_ISSUE_PATTERN.test(body);
  }

  /** Whether this value can be read by property name at all. */
  private isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
  }

  // 🌎 Public Methods

  /**
   * Records the failure and its fixes when the type does not fit the position.
   *
   * Skipped when the source could not read the issue's type or parent.
   */
  public check(
    issueNumber: string,
    facts: IssueTypeFacts,
    record: (failure: string, ...commands: string[]) => void,
  ): void {
    const { hasParent, issueType } = facts;

    if (issueType === undefined || hasParent === undefined) {
      return;
    }

    if (hasParent) {
      this.checkSubIssue(issueNumber, issueType, record);
    } else {
      this.checkRoot(issueNumber, issueType, record);
    }
  }

  /** Reads the type facts out of a parsed `gh issue view` document. */
  public readFromDocument(
    document: Record<string, unknown>,
    body: string,
  ): IssueTypeFacts {
    if (!("issueType" in document)) {
      return {};
    }

    const { issueType, parent } = document;
    const hasNativeParent =
      this.isRecord(parent) && typeof parent["number"] === "number";
    const name = this.isRecord(issueType) ? issueType["name"] : undefined;

    return {
      hasParent: hasNativeParent || this.hasBodyParent(body),
      issueType: typeof name === "string" ? name : null,
    };
  }

  /** Reads the type facts out of one issue of a `gh issue list` sweep. */
  public readFromSummary(issue: IssueSummary): IssueTypeFacts {
    if (issue.issueType === undefined) {
      return {};
    }

    return {
      hasParent:
        (issue.parent ?? null) !== null || this.hasBodyParent(issue.body),
      issueType: issue.issueType?.name ?? null,
    };
  }
}
