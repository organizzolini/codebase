import { Injectable } from "@nestjs/common";

import {
  CONVENTIONAL_TITLE_PATTERN,
  DO_NOT_MERGE_LABEL,
  SCOPE_LABEL_PREFIX,
  SOURCE_LABEL_PREFIX,
  SOURCE_LABELS,
  TITLE_SCOPE_SEPARATOR_PATTERN,
  TYPE_LABEL_PREFIX,
} from "./pull-request-labels-assignees.constants";

import type {
  GroupedLabels,
  MetadataVerdict,
  PullRequestLabelsAssignees,
  TitleConvention,
} from "./pull-request-labels-assignees.types";

/**
 * Reads a pull request's metadata and says whether it agrees with its title.
 *
 * Pure throughout: every method is a function of what it is handed, so the
 * whole rule set is testable without a pull request, a token, or a network.
 * Reading the metadata from GitHub is the command's job, not this one's.
 */
@Injectable()
export class PullRequestLabelsAssigneesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Scope labels must match the title's scopes both ways. With no title scope, it is one
   * failure and no comparison.
   */
  private checkScopeLabels(
    options: {
      readonly pullRequestNumber: string;
      readonly titleConvention: TitleConvention;
    },
    labels: GroupedLabels,
    record: (failure: string, ...commands: string[]) => void,
  ): void {
    const { scopes, type } = options.titleConvention;

    if (scopes.length === 0) {
      record(`❌ No scope in title: retitle as ${type}(<scope>): …`);
      return;
    }

    for (const scope of scopes) {
      if (!labels.scopeLabels.includes(`${SCOPE_LABEL_PREFIX}${scope}`)) {
        record(
          `❌ Missing scope label: ${SCOPE_LABEL_PREFIX}${scope}`,
          `gh pr edit ${options.pullRequestNumber} --add-label ${SCOPE_LABEL_PREFIX}${scope}`,
        );
      }
    }

    for (const scopeLabel of labels.scopeLabels) {
      if (!scopes.includes(scopeLabel.slice(SCOPE_LABEL_PREFIX.length))) {
        record(
          `❌ Unexpected scope label: ${scopeLabel}`,
          `gh pr edit ${options.pullRequestNumber} --remove-label ${scopeLabel}`,
        );
      }
    }
  }

  /**
   * Exactly one source label, one of the two that exist. A missing one gets two
   * alternative commands.
   */
  private checkSourceLabel(
    pullRequestNumber: string,
    labels: GroupedLabels,
    record: (failure: string, ...commands: string[]) => void,
  ): void {
    const sourceLabel = labels.sourceLabels[0];
    const isValid =
      labels.sourceLabels.length === 1 &&
      sourceLabel !== undefined &&
      SOURCE_LABELS.includes(sourceLabel);

    if (isValid) {
      return;
    }

    const found =
      labels.sourceLabels.length === 0 ? "none" : labels.sourceLabels.join(" ");

    record(
      `❌ Expected exactly one source label: ${SOURCE_LABELS.join(" or ")} (found: ${found})`,
      ...labels.sourceLabels.map(
        (label) => `gh pr edit ${pullRequestNumber} --remove-label ${label}`,
      ),
      "add exactly one source label, either:",
      ...SOURCE_LABELS.map(
        (label) => `gh pr edit ${pullRequestNumber} --add-label ${label}`,
      ),
    );
  }

  /** Exactly one type label, and it is the one the title's type names. */
  private checkTypeLabel(
    options: {
      readonly pullRequestNumber: string;
      readonly titleConvention: TitleConvention;
    },
    labels: GroupedLabels,
    record: (failure: string, ...commands: string[]) => void,
  ): void {
    const expected = `${TYPE_LABEL_PREFIX}${options.titleConvention.type}`;
    const hasExpected = labels.typeLabels.includes(expected);

    if (labels.typeLabels.length === 1 && hasExpected) {
      return;
    }

    const found =
      labels.typeLabels.length === 0 ? "none" : labels.typeLabels.join(" ");

    record(
      `❌ Expected exactly one type label: ${expected} (found: ${found})`,
      ...labels.typeLabels
        .filter((label) => label !== expected)
        .map(
          (label) =>
            `gh pr edit ${options.pullRequestNumber} --remove-label ${label}`,
        ),
      ...(hasExpected
        ? []
        : [`gh pr edit ${options.pullRequestNumber} --add-label ${expected}`]),
    );
  }

  // 🌎 Public Methods

  /**
   * Every way the pull request's metadata disagrees with its title, with a
   * `gh pr edit` fix where one exists.
   */
  public checkMetadata(options: {
    readonly metadata: PullRequestLabelsAssignees;
    readonly pullRequestNumber: string;
    readonly titleConvention: TitleConvention;
  }): MetadataVerdict {
    const failures: string[] = [];
    const remediationCommands: string[] = [];
    const labels = this.groupLabels(options.metadata.labelNames);
    const record = (failure: string, ...commands: string[]): void => {
      failures.push(failure);
      remediationCommands.push(...commands);
    };

    this.checkTypeLabel(options, labels, record);
    this.checkScopeLabels(options, labels, record);

    if (labels.doNotMergePresent) {
      record(
        "❌ Blocked by the do-not-merge label",
        `gh pr edit ${options.pullRequestNumber} --remove-label ${DO_NOT_MERGE_LABEL}`,
      );
    }

    if (options.metadata.assigneeLogins.length === 0) {
      record(
        "❌ No assignee",
        `gh pr edit ${options.pullRequestNumber} --add-assignee @me`,
      );
    }

    this.checkSourceLabel(options.pullRequestNumber, labels, record);

    return { failures, remediationCommands };
  }

  /** Whatever went wrong, as the one line a report can carry. */
  public describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /** Sorts one pull request's labels into the families the checks ask about. */
  public groupLabels(labelNames: readonly string[]): GroupedLabels {
    return {
      doNotMergePresent: labelNames.includes(DO_NOT_MERGE_LABEL),
      scopeLabels: labelNames.filter((name) =>
        name.startsWith(SCOPE_LABEL_PREFIX),
      ),
      sourceLabels: labelNames.filter((name) =>
        name.startsWith(SOURCE_LABEL_PREFIX),
      ),
      typeLabels: labelNames.filter((name) =>
        name.startsWith(TYPE_LABEL_PREFIX),
      ),
    };
  }

  /**
   * Reads the type and scopes of a conventional title. A title that cannot be parsed
   * returns `undefined`; no scope gives an empty list.
   */
  public parseTitle(title: string): TitleConvention | undefined {
    const match = CONVENTIONAL_TITLE_PATTERN.exec(title.trim());
    const titleType = match?.[1];

    if (match === null || titleType === undefined) {
      return undefined;
    }

    const scopes = [
      ...new Set(
        (match[2] ?? "")
          .split(TITLE_SCOPE_SEPARATOR_PATTERN)
          .map((scope) => scope.trim().toLowerCase())
          .filter((scope) => scope !== ""),
      ),
    ];

    return { scopes, type: titleType };
  }
}
