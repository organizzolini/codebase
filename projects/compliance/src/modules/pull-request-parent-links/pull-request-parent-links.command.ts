import { readFileSync, writeFileSync } from "node:fs";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { IssueMetadataService } from "../issue-metadata/issue-metadata.service";
import { PULL_REQUEST_BODY_FILE_VARIABLE } from "../pull-request-context/pull-request-context.constants";
import { PullRequestMetadataGithubService } from "../pull-request-metadata/pull-request-metadata-github.service";

import {
  issueParentSchema,
  linkedIssueNumbersSchema,
  PULL_REQUEST_NUMBER_PATTERN,
  PULL_REQUEST_NUMBER_VARIABLE,
} from "./pull-request-parent-links.constants";
import { PullRequestParentLinksService } from "./pull-request-parent-links.service";

import type { PullRequestParentLinksContext } from "./pull-request-parent-links.types";

/** Adds non-closing references to every parent issue of a linked issue. */
@Command({
  description: "Add parent issue references to a pull request body",
  name: "pull-request-parent-links",
})
@Injectable()
export class PullRequestParentLinksCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly githubService: PullRequestMetadataGithubService,
    private readonly issueMetadataService: IssueMetadataService,
    private readonly logger: LoggerService,
    private readonly pullRequestParentLinksService: PullRequestParentLinksService,
  ) {
    super();
    this.logger.setContext(PullRequestParentLinksCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Adds missing ancestor references and reports malformed pull request bodies. */
  private addAncestorReferences(
    body: string,
    ancestorNumbers: readonly number[],
  ): string {
    try {
      return this.pullRequestParentLinksService.addRelatedIssueReferences(
        body,
        ancestorNumbers,
      );
    } catch (error) {
      return this.fail(
        `❌ Unable to add parent issue references: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /** Adds the parent chain of one linked issue to the shared ancestor set. */
  private addIssueAncestors(
    linkedIssueNumber: number,
    issueParents: Map<number, null | number>,
    ancestorNumbers: Set<number>,
  ): void {
    const visited = new Set([linkedIssueNumber]);
    let currentIssueNumber: null | number = linkedIssueNumber;

    while (currentIssueNumber !== null) {
      let parentIssueNumber = issueParents.get(currentIssueNumber);

      if (parentIssueNumber === undefined) {
        parentIssueNumber =
          this.readParentIssueNumber(currentIssueNumber) ?? null;
        issueParents.set(currentIssueNumber, parentIssueNumber);
      }

      if (parentIssueNumber === null) {
        currentIssueNumber = null;

        continue;
      }

      if (visited.has(parentIssueNumber)) {
        this.fail(
          `❌ Issue hierarchy contains a cycle while following issue #${String(linkedIssueNumber)}`,
        );
      }

      visited.add(parentIssueNumber);
      ancestorNumbers.add(parentIssueNumber);
      currentIssueNumber = parentIssueNumber;
    }
  }

  /** Exits with an actionable error instead of reporting a false success. */
  private fail(message: string): never {
    this.logger.error(message);

    return process.exit(1);
  }

  /** Parses native or body-linked parent data returned by GitHub. */
  private parseParentIssueNumber(
    issueNumber: number,
    standardOutput: string,
  ): number | undefined {
    let response: unknown;

    try {
      response = JSON.parse(standardOutput) as unknown;
    } catch (error) {
      this.fail(
        `❌ Unable to parse issue #${String(issueNumber)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const issue = issueParentSchema.safeParse(response);

    if (!issue.success) {
      this.fail(
        `❌ Invalid parent data for issue #${String(issueNumber)}: ${issue.error.message}`,
      );
    }

    return (
      issue.data.parent?.number ??
      this.issueMetadataService.extractParentIssueNumber(issue.data.body ?? "")
    );
  }

  /** Collects every ancestor once across all directly linked issues. */
  private readAncestorIssueNumbers(
    linkedIssueNumbers: readonly number[],
  ): number[] {
    const ancestorNumbers = new Set<number>();
    const issueParents = new Map<number, null | number>();

    for (const linkedIssueNumber of linkedIssueNumbers) {
      this.addIssueAncestors(linkedIssueNumber, issueParents, ancestorNumbers);
    }

    const directlyLinkedNumbers = new Set(linkedIssueNumbers);

    return [...ancestorNumbers].filter(
      (issueNumber) => !directlyLinkedNumbers.has(issueNumber),
    );
  }

  /** Reads the linked issues from GitHub. */
  private readLinkedIssueNumbers(pullRequestNumber: string): number[] {
    const result = this.githubService.run([
      "pr",
      "view",
      pullRequestNumber,
      "--json",
      "closingIssuesReferences",
      "--jq",
      "[.closingIssuesReferences[].number]",
    ]);

    if (!result.succeeded) {
      this.fail(
        `❌ Unable to read issues linked to pull request #${pullRequestNumber}: ${this.githubService.describeFailure(result)}`,
      );
    }

    let response: unknown;

    try {
      response = JSON.parse(result.standardOutput) as unknown;
    } catch (error) {
      this.fail(
        `❌ Unable to parse linked issues for pull request #${pullRequestNumber}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const linkedIssues = linkedIssueNumbersSchema.safeParse(response);

    if (!linkedIssues.success) {
      this.fail(
        `❌ Invalid linked issues for pull request #${pullRequestNumber}: ${linkedIssues.error.message}`,
      );
    }

    return linkedIssues.data;
  }

  /** Reads an issue and returns its native or body-linked parent. */
  private readParentIssueNumber(issueNumber: number): number | undefined {
    const result = this.githubService.run([
      "issue",
      "view",
      String(issueNumber),
      "--json",
      "body,parent",
      "--jq",
      "{body: .body, parent: .parent}",
    ]);

    if (!result.succeeded) {
      this.fail(
        `❌ Unable to read issue #${String(issueNumber)}: ${this.githubService.describeFailure(result)}`,
      );
    }

    return this.parseParentIssueNumber(issueNumber, result.standardOutput);
  }

  /** Reads the pull request body from its workflow-provided file. */
  private readPullRequestBody(bodyPath: string): string {
    try {
      return readFileSync(bodyPath, "utf8");
    } catch (error) {
      return this.fail(
        `❌ Unable to read pull request body: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /** Resolves and validates the pull request context supplied by the workflow. */
  private resolveContext(
    passedParameters: readonly string[],
  ): PullRequestParentLinksContext {
    if (passedParameters.length > 0) {
      this.fail("❌ pull-request-parent-links does not accept arguments");
    }

    const pullRequestNumber = process.env[PULL_REQUEST_NUMBER_VARIABLE] ?? "";
    const bodyPath = process.env[PULL_REQUEST_BODY_FILE_VARIABLE] ?? "";

    if (!PULL_REQUEST_NUMBER_PATTERN.test(pullRequestNumber)) {
      this.fail(
        `❌ Expected ${PULL_REQUEST_NUMBER_VARIABLE} to be a positive integer`,
      );
    }

    if (bodyPath === "") {
      this.fail(`❌ Expected ${PULL_REQUEST_BODY_FILE_VARIABLE} to be set`);
    }

    return { bodyPath, pullRequestNumber };
  }

  /** Reconciles the pull request body with every linked issue's parent chain. */
  private synchronizeParentReferences(
    context: PullRequestParentLinksContext,
  ): void {
    const { bodyPath, pullRequestNumber } = context;
    const linkedIssueNumbers = this.readLinkedIssueNumbers(pullRequestNumber);

    if (linkedIssueNumbers.length === 0) {
      this.logger.info(
        `⏭️ Skipped pull request #${pullRequestNumber} because it has no linked issues`,
      );

      return;
    }

    const body = this.readPullRequestBody(bodyPath);
    const ancestorNumbers = this.readAncestorIssueNumbers(linkedIssueNumbers);
    const updatedBody = this.addAncestorReferences(body, ancestorNumbers);

    if (updatedBody === body) {
      this.logger.info(
        `✅ Kept pull request #${pullRequestNumber} unchanged because it already references all parent issues`,
      );

      return;
    }

    this.updatePullRequestBody(pullRequestNumber, bodyPath, updatedBody);
  }

  /** Writes the reconciled body to disk and updates GitHub. */
  private updatePullRequestBody(
    pullRequestNumber: string,
    bodyPath: string,
    body: string,
  ): void {
    try {
      writeFileSync(bodyPath, body, "utf8");
    } catch (error) {
      this.fail(
        `❌ Unable to update pull request body file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const result = this.githubService.run([
      "pr",
      "edit",
      pullRequestNumber,
      "--body-file",
      bodyPath,
    ]);

    if (!result.succeeded) {
      this.fail(
        `❌ Unable to update pull request #${pullRequestNumber}: ${this.githubService.describeFailure(result)}`,
      );
    }

    this.logger.info(
      `✅ Added parent issue references to pull request #${pullRequestNumber}`,
    );
  }

  // 🌎 Public Methods

  /** Runs the parent reference synchronization command. */
  public async run(passedParameters: string[]): Promise<void> {
    await Promise.resolve();
    this.synchronizeParentReferences(this.resolveContext(passedParameters));
  }
}
