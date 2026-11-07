import { Injectable } from "@nestjs/common";

import {
  ALL_ISSUES_FLAG,
  ALL_ISSUES_SHORT_FLAG,
  ISSUE_NUMBER_PATTERN,
} from "./issue-metadata.constants";
import {
  ISSUE_OPENED_ACTION,
  issueAssigneesSchema,
  issueLabelsSchema,
  ISSUES_EVENT,
  SWEEP_EVENTS,
  USAGE_LINES,
  WRITE_ARGUMENT,
} from "./issue.constants";

import type { IssuePlanResolution } from "./issue.types";

/** Decides, from the event and the arguments, what one issue run does. */
@Injectable()
export class IssuePlanService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether the event says the issue has nobody assigned yet. */
  private hasNoAssignee(document: string | undefined): boolean {
    if (document === undefined || document === "") {
      return true;
    }

    try {
      const assignees = issueAssigneesSchema.safeParse(JSON.parse(document));

      return !assignees.success || assignees.data.length === 0;
    } catch {
      return true;
    }
  }

  /** The labels the event carried; none when the document is unusable. */
  private readLabelNames(document: string | undefined): string[] {
    try {
      const labels = issueLabelsSchema.safeParse(JSON.parse(document ?? "[]"));

      return labels.success
        ? labels.data.map((label) =>
            typeof label === "string" ? label : label.name,
          )
        : [];
    } catch {
      return [];
    }
  }

  // 🌎 Public Methods

  /** What this invocation has been asked to do, or why it cannot be. */
  public resolve(
    passedParameters: readonly string[],
    options: undefined | { readonly all?: boolean },
    environment: NodeJS.ProcessEnv,
  ): IssuePlanResolution {
    const eventName = environment["GITHUB_EVENT_NAME"] ?? "";
    const words = passedParameters.filter((word) => word !== WRITE_ARGUMENT);
    const allIssues =
      options?.all === true ||
      words.includes(ALL_ISSUES_FLAG) ||
      words.includes(ALL_ISSUES_SHORT_FLAG) ||
      SWEEP_EVENTS.includes(eventName);
    const named = words.filter(
      (word) => word !== ALL_ISSUES_FLAG && word !== ALL_ISSUES_SHORT_FLAG,
    );
    const writable =
      passedParameters.includes(WRITE_ARGUMENT) ||
      eventName === ISSUES_EVENT ||
      SWEEP_EVENTS.includes(eventName);
    const number =
      named[0] ??
      (eventName === ISSUES_EVENT ? environment["ISSUE_NUMBER"] : undefined);

    if (named.length > 1 || (allIssues && named.length > 0)) {
      return {
        failure: `❌ Expected an issue number or --all\n${USAGE_LINES.join("\n")}`,
        ok: false,
      };
    }

    if (
      !allIssues &&
      (number === undefined || !ISSUE_NUMBER_PATTERN.test(number))
    ) {
      return {
        failure: `❌ Expected an issue number, --all, or a supported GitHub event\n${USAGE_LINES.join("\n")}`,
        ok: false,
      };
    }

    return {
      ok: true,
      plan: {
        allIssues,
        body: environment["ISSUE_BODY"] ?? "",
        labelNames: this.readLabelNames(environment["ISSUE_LABELS"]),
        needsAssignee: this.hasNoAssignee(environment["ISSUE_ASSIGNEES"]),
        newlyOpened:
          eventName === ISSUES_EVENT &&
          environment["ISSUE_ACTION"] === ISSUE_OPENED_ACTION,
        ...(allIssues || number === undefined ? {} : { number }),
        writable,
      },
    };
  }
}
