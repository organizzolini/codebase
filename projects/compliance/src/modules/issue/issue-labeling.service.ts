import { Injectable } from "@nestjs/common";

import { IssueGithubService } from "./issue-github.service";
import { IssueLabelsService } from "./issue-labels.service";

/** Adds the labels a freshly filed `issue.yml` submission implies. */
@Injectable()
export class IssueLabelingService {
  // 🏗 Dependency Injection

  constructor(
    private readonly issueGithubService: IssueGithubService,
    private readonly issueLabelsService: IssueLabelsService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * One line per label added or failed, and never a failure of the run: a
   * label that cannot be added is a fact about the environment, and the audit
   * that follows reports whatever is still missing.
   */
  public label(options: {
    readonly body: string;
    readonly existingLabelNames: readonly string[];
    readonly issueNumber: string;
  }): string[] {
    const missing = this.issueLabelsService.missingLabels(
      this.issueLabelsService.parseFormAnswers(options.body),
      options.existingLabelNames,
    );

    if (missing.length === 0) {
      return [];
    }

    if (!this.issueGithubService.isAvailable()) {
      return ["⚠️ Skipping labels: gh is not available"];
    }

    return missing.map((label) => {
      const result = this.issueGithubService.addLabel(
        options.issueNumber,
        label,
      );

      return result.succeeded
        ? `🏷️ Added ${label} to issue ${options.issueNumber}`
        : `⚠️ Failed to add ${label} to issue ${options.issueNumber}: ${this.issueGithubService.describeFailure(result)}`;
    });
  }
}
