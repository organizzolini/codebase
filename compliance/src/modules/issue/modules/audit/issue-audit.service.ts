import { Injectable } from "@nestjs/common";

import { IssueGithubService } from "../github/issue-github.service";
import { IssueMetadataService } from "../metadata/issue-metadata.service";

import type { IssueOutcome } from "../../issue.types";
import type { MetadataVerdict } from "../metadata/issue-metadata.types";

/** Audits issue metadata and hierarchy, one issue or every open one. */
@Injectable()
export class IssueAuditService {
  // 🏗 Dependency Injection

  constructor(
    private readonly issueGithubService: IssueGithubService,
    private readonly issueMetadataService: IssueMetadataService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** A failure that is the whole of an outcome. */
  private fail(message: string): IssueOutcome {
    return { failures: [message], lines: [message] };
  }

  /** The outcome of one issue's audit, with the commands that fix it. */
  private report(verdict: MetadataVerdict): IssueOutcome {
    if (verdict.failures.length === 0) {
      return { failures: [], lines: ["✅ Issue metadata is valid"] };
    }

    return {
      failures: verdict.failures,
      lines: [
        "❌ Issue metadata is invalid",
        "",
        ...verdict.failures.map((failure) => `- ${failure}`),
        ...(verdict.remediationCommands.length === 0
          ? []
          : [
              "",
              "🔧 Fix with:",
              "",
              ...verdict.remediationCommands.map((command) => `- ${command}`),
            ]),
      ],
    };
  }

  // 🌎 Public Methods

  /** Audits every open issue and the hierarchy between them. */
  public auditAll(): IssueOutcome {
    if (!this.issueGithubService.isAvailable()) {
      return this.fail("❌ Unable to list open issues: gh is not available");
    }

    const listing = this.issueGithubService.listOpenIssues();

    if (!listing.success || listing.issues === undefined) {
      return this.fail(
        `❌ Unable to list open issues: ${listing.error ?? "unknown error"}`,
      );
    }

    const verdict = this.issueMetadataService.checkBulkIssues(listing.issues);

    if (verdict.failureCount === 0) {
      return {
        failures: [],
        lines: [
          `✅ All ${String(verdict.totalIssues)} open issues and hierarchy relationships are compliant`,
        ],
      };
    }

    return {
      failures: verdict.failures,
      lines: [
        `❌ Found ${String(verdict.failures.length)} compliance issue(s) across ${String(verdict.totalIssues)} open issue(s)`,
        "",
        ...verdict.failures.map((failure) => `- ${failure}`),
      ],
    };
  }

  /** Audits one issue, read live, against its own body and fields. */
  public auditOne(issueNumber: string): IssueOutcome {
    if (!this.issueGithubService.isAvailable()) {
      return this.fail(
        `❌ Unable to read issue ${issueNumber}: gh is not available`,
      );
    }

    const view = this.issueGithubService.run([
      "issue",
      "view",
      issueNumber,
      "--json",
      "body,labels,issueType,parent",
    ]);

    if (!view.succeeded) {
      return this.fail(
        `❌ Unable to read issue ${issueNumber}: gh issue view failed (${this.issueGithubService.describeFailure(view)})`,
      );
    }

    const resolution = this.issueMetadataService.resolveFromDocument(
      view.standardOutput,
    );

    if (!resolution.resolved) {
      return this.fail(resolution.failure);
    }

    const fields = this.issueGithubService.readFieldNames(issueNumber);

    if (!fields.success || fields.fieldNames === undefined) {
      return this.fail(
        `❌ Unable to read the issue fields of issue ${issueNumber}: ${fields.error ?? "unknown error"}`,
      );
    }

    const verdict = this.issueMetadataService.checkMetadata({
      formAnswers: this.issueMetadataService.parseFormAnswers(
        resolution.metadata.body,
      ),
      issueNumber,
      metadata: { ...resolution.metadata, fieldNames: fields.fieldNames },
    });

    return this.report(verdict);
  }
}
