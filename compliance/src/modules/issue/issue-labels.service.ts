import { Injectable } from "@nestjs/common";

import {
  SCOPE_FIELD_LABEL,
  SCOPE_LABEL_PREFIX,
  TYPE_FIELD_LABEL,
  TYPE_LABEL_PREFIX,
} from "./issue-metadata.constants";

import type { IssueFormAnswers } from "./issue-metadata.types";

/**
 * Reads a submitted `issue.yml` body and says which labels it implies.
 *
 * Pure, so the rules are testable without a network.
 *
 * Only labels a submitted form named are added; an API-opened issue has no answers.
 */
@Injectable()
export class IssueLabelsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Reads one dropdown field's answer out of a rendered issue-form body.
   *
   * An unfilled optional field renders as `_No response_`, which means no answer.
   */
  private extractFormField(body: string, label: string): string | undefined {
    const pattern = new RegExp(
      String.raw`### ${label}\r?\n\r?\n([^\r\n]+)`,
      "u",
    );
    const match = pattern.exec(body);
    const value = match?.[1]?.trim();

    return value === undefined || value === "" || value === "_No response_"
      ? undefined
      : value;
  }

  // 🌎 Public Methods

  /**
   * The labels this issue's form answers imply, whichever of the two it has.
   */
  public labelsFromAnswers(formAnswers: IssueFormAnswers): string[] {
    const labels: string[] = [];

    if (formAnswers.type !== undefined) {
      labels.push(`${TYPE_LABEL_PREFIX}${formAnswers.type}`);
    }
    if (formAnswers.scope !== undefined) {
      labels.push(`${SCOPE_LABEL_PREFIX}${formAnswers.scope}`);
    }

    return labels;
  }

  /**
   * The labels the form implies that this issue does not already carry.
   */
  public missingLabels(
    formAnswers: IssueFormAnswers,
    existingLabelNames: readonly string[],
  ): string[] {
    return this.labelsFromAnswers(formAnswers).filter(
      (label) => !existingLabelNames.includes(label),
    );
  }

  /**
   * Reads the Type and Scope answers out of a rendered `issue.yml`
   * submission, if this body carries them at all.
   */
  public parseFormAnswers(body: string): IssueFormAnswers {
    const type = this.extractFormField(body, TYPE_FIELD_LABEL);
    const scope = this.extractFormField(body, SCOPE_FIELD_LABEL);

    return {
      ...(type === undefined ? {} : { type }),
      ...(scope === undefined ? {} : { scope }),
    };
  }
}
