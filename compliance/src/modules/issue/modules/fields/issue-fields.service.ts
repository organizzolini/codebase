import { Injectable } from "@nestjs/common";

import { PRIORITY_FIELD } from "./issue-fields.constants";

import type {
  IssueField,
  IssueFieldFacts,
  IssueFieldTarget,
} from "./issue-fields.types";

/**
 * Judges an issue's organization issue fields. A root issue, a spec or a
 * standalone one, carries a Priority; Effort is the pull request check's
 * to require, since only it knows which issue a pull request is built for.
 */
@Injectable()
export class IssueFieldsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Records the failure and its fix when the issue leaves the field empty. */
  public checkField(
    target: IssueFieldTarget,
    field: IssueField,
    record: (failure: string, ...commands: string[]) => void,
  ): void {
    const { fieldNames, issueNumber } = target;

    if (fieldNames.includes(field.name)) {
      return;
    }

    const value = JSON.stringify({
      issue_field_values: [
        { field_id: field.id, value: `<${field.options.join("|")}>` },
      ],
    });

    record(
      `❌ No ${field.name} issue field`,
      `echo '${value}' | gh api -X POST repos/{owner}/{repo}/issues/${issueNumber}/issue-field-values --input -`,
    );
  }

  /** A root issue owes a Priority. Skipped when its fields or parent are unreadable. */
  public checkPriority(
    issueNumber: string,
    facts: IssueFieldFacts,
    record: (failure: string, ...commands: string[]) => void,
  ): void {
    const { fieldNames, hasParent } = facts;

    if (fieldNames === undefined || hasParent !== false) {
      return;
    }

    this.checkField({ fieldNames, issueNumber }, PRIORITY_FIELD, record);
  }
}
