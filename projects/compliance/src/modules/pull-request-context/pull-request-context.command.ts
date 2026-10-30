import { appendFileSync, writeFileSync } from "node:fs";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { PullRequestMetadataGithubService } from "../pull-request-metadata/pull-request-metadata-github.service";

import {
  GITHUB_OUTPUT_VARIABLE,
  MERGE_GROUP_HEAD_REF_PATTERN,
  PULL_REQUEST_BODY_FILE_VARIABLE,
  PULL_REQUEST_CONTEXT_QUERY,
  PULL_REQUEST_TITLE_FILE_VARIABLE,
  pullRequestContextSchema,
} from "./pull-request-context.constants";

/**
 * Resolves the pull request under review and writes its metadata for workflow
 * steps, including merge-queue events whose payload contains only a synthetic
 * ref.
 */
@Command({
  description: "Resolve pull request context for workflow checks",
  name: "pull-request-context",
})
@Injectable()
export class PullRequestContextCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly githubService: PullRequestMetadataGithubService,
  ) {
    super();
    this.logger.setContext(PullRequestContextCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Exits with an actionable error instead of reporting a false success. */
  private fail(message: string): never {
    this.logger.error(message);

    return process.exit(1);
  }

  /** Resolves the PR number from an event payload or the merge-queue ref. */
  private resolvePullRequestNumber(): string {
    const eventName = process.env["GITHUB_EVENT_NAME"] ?? "";

    if (eventName === "merge_group") {
      const pullRequestNumber = MERGE_GROUP_HEAD_REF_PATTERN.exec(
        process.env["HEAD_REF"] ?? "",
      )?.[1];

      if (pullRequestNumber === undefined) {
        this.fail(
          `❌ Unable to parse a pull request number from HEAD_REF (${process.env["HEAD_REF"] ?? "unset"})`,
        );
      }

      return pullRequestNumber;
    }

    if (eventName !== "pull_request") {
      this.fail(
        `❌ Expected a pull_request or merge_group event, received ${eventName || "none"}`,
      );
    }

    const pullRequestNumber = process.env["PULL_REQUEST_NUMBER"] ?? "";

    if (!/^[1-9]\d*$/u.test(pullRequestNumber)) {
      this.fail("❌ Expected PULL_REQUEST_NUMBER to be a positive integer");
    }

    return pullRequestNumber;
  }

  /** Writes the resolved values to workflow outputs and the requested files. */
  private writeContext(
    context: {
      readonly author: string;
      readonly body: null | string;
      readonly number: number;
      readonly title: string;
    },
    requestedNumber: string,
  ): void {
    const outputPath = process.env[GITHUB_OUTPUT_VARIABLE] ?? "";
    const titlePath = process.env[PULL_REQUEST_TITLE_FILE_VARIABLE] ?? "";
    const bodyPath = process.env[PULL_REQUEST_BODY_FILE_VARIABLE] ?? "";

    if (outputPath === "" || titlePath === "" || bodyPath === "") {
      this.fail(
        `❌ Expected ${GITHUB_OUTPUT_VARIABLE}, ${PULL_REQUEST_TITLE_FILE_VARIABLE}, and ${PULL_REQUEST_BODY_FILE_VARIABLE} to be set`,
      );
    }

    if (String(context.number) !== requestedNumber) {
      this.fail(
        `❌ GitHub returned pull request ${String(context.number)} when ${requestedNumber} was requested`,
      );
    }

    try {
      writeFileSync(titlePath, context.title, "utf8");
      writeFileSync(bodyPath, context.body ?? "", "utf8");
      appendFileSync(
        outputPath,
        `pull-request-number=${String(context.number)}\npull-request-author=${context.author}\n`,
        "utf8",
      );
    } catch (error) {
      this.fail(
        `❌ Unable to write pull request context: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // 🌎 Public Methods

  /** Resolves live metadata and writes workflow outputs and files. */
  public async run(passedParameters: string[]): Promise<void> {
    await Promise.resolve();

    if (passedParameters.length > 0) {
      this.fail("❌ pull-request-context does not accept arguments");
    }

    const pullRequestNumber = this.resolvePullRequestNumber();
    const result = this.githubService.run([
      "api",
      `repos/{owner}/{repo}/pulls/${pullRequestNumber}`,
      "--jq",
      PULL_REQUEST_CONTEXT_QUERY,
    ]);

    if (!result.succeeded) {
      this.fail(
        `❌ Unable to read pull request ${pullRequestNumber}: ${this.githubService.describeFailure(result)}`,
      );
    }

    let response: unknown;

    try {
      response = JSON.parse(result.standardOutput) as unknown;
    } catch (error) {
      this.fail(
        `❌ Unable to parse pull request ${pullRequestNumber} context: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const context = pullRequestContextSchema.safeParse(response);

    if (!context.success) {
      this.fail(
        `❌ Invalid pull request ${pullRequestNumber} context: ${context.error.message}`,
      );
    }

    this.writeContext(context.data, pullRequestNumber);
    this.logger.info(
      `✅ Resolved pull request #${String(context.data.number)} by ${context.data.author}`,
    );
  }
}
