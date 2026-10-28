import { Injectable } from "@nestjs/common";

import { pullRequestDocumentSchema } from "./pull-request-issue.constants";

import type { PullRequestIssuesResolution } from "./pull-request-issue.types";

/**
 * Reads which issues a pull request closes out of a `gh pr view` document.
 *
 * `closingIssuesReferences` is GitHub's own record of the link, whether it came
 * from a closing keyword in the body or from the Development sidebar, so
 * nothing here parses a description. A document with the field missing reads
 * as no issues rather than as an error: the check's job is to say the link is
 * absent.
 */
@Injectable()
export class PullRequestIssueService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Reads the closing issue numbers out of a `gh pr view` document. */
  public resolveFromDocument(
    documentText: string,
  ): PullRequestIssuesResolution {
    let parsed: unknown;

    try {
      parsed = JSON.parse(documentText);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);

      return {
        failure: `❌ Unable to parse the gh pr view output: ${reason}`,
        resolved: false,
      };
    }

    const result = pullRequestDocumentSchema.safeParse(parsed);
    const references = result.success
      ? (result.data.closingIssuesReferences ?? [])
      : [];

    return {
      issueNumbers: references.map((reference) => reference.number),
      resolved: true,
    };
  }
}
