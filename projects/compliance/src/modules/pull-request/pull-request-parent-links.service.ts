import { Injectable } from "@nestjs/common";

import {
  ISSUE_REFERENCE_PATTERN,
  PULL_REQUEST_RELATED_HEADING,
} from "./pull-request-parent-links.constants";

/** Adds non-closing ancestor references to a pull request body. */
@Injectable()
export class PullRequestParentLinksService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Inserts references before trailing blank lines in the Related section. */
  private insertReferences(
    lines: string[],
    sectionEndIndex: number,
    missingNumbers: readonly number[],
  ): void {
    const headingIndex = lines.indexOf(PULL_REQUEST_RELATED_HEADING);
    let insertIndex = sectionEndIndex;

    while (insertIndex > headingIndex + 1 && lines[insertIndex - 1] === "") {
      insertIndex -= 1;
    }

    lines.splice(
      insertIndex,
      0,
      ...missingNumbers.map((number) => `- Related to #${String(number)}`),
    );
  }

  /** Returns issue numbers referenced in the pull request's Related section. */
  private readExistingIssueNumbers(
    lines: readonly string[],
    headingIndex: number,
    sectionEndIndex: number,
  ): Set<number> {
    return new Set(
      lines
        .slice(headingIndex + 1, sectionEndIndex)
        .flatMap((line) =>
          [...line.matchAll(ISSUE_REFERENCE_PATTERN)].map((match) =>
            Number(match.groups?.["issueNumber"]),
          ),
        ),
    );
  }

  // 🌎 Public Methods

  /** Adds one Related-list bullet for each ancestor not already referenced. */
  public addRelatedIssueReferences(
    body: string,
    ancestorNumbers: readonly number[],
  ): string {
    if (ancestorNumbers.length === 0) {
      return body;
    }

    const lineEnding = body.includes("\r\n") ? "\r\n" : "\n";
    const lines = body.split(/\r?\n/u);
    const headingIndex = lines.indexOf(PULL_REQUEST_RELATED_HEADING);

    if (headingIndex === -1) {
      throw new Error(
        `Pull request body is missing ${PULL_REQUEST_RELATED_HEADING}`,
      );
    }

    const nextHeadingIndex = lines.findIndex(
      (line, index) => index > headingIndex && /^##(?:\s|$)/u.test(line),
    );
    const sectionEndIndex =
      nextHeadingIndex === -1 ? lines.length : nextHeadingIndex;
    const existingNumbers = this.readExistingIssueNumbers(
      lines,
      headingIndex,
      sectionEndIndex,
    );
    const missingNumbers = [
      ...new Set(
        ancestorNumbers.filter((number) => !existingNumbers.has(number)),
      ),
    ];

    if (missingNumbers.length === 0) {
      return body;
    }

    this.insertReferences(lines, sectionEndIndex, missingNumbers);

    return lines.join(lineEnding);
  }
}
