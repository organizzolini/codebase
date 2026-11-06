import { appendFileSync } from "node:fs";

import { Injectable } from "@nestjs/common";

import {
  GITHUB_OUTPUT_VARIABLE,
  MERGE_GROUP_HEAD_REF_PATTERN,
  PULL_REQUEST_CONTEXT_QUERY,
  PULL_REQUEST_NUMBER_PATTERN,
  pullRequestContextSchema,
} from "./pull-request-context.constants";
import { PullRequestGithubService } from "./pull-request-github.service";
import {
  MERGE_GROUP_EVENT,
  PULL_REQUEST_EVENT,
  USAGE_LINES,
} from "./pull-request.constants";

import type { PullRequestContext } from "./pull-request-context.types";
import type {
  PullRequestInvocation,
  PullRequestResult,
} from "./pull-request.types";

/**
 * Works out which pull request a run is about, and reads its live state.
 *
 * The number comes from the first argument when there is one, and otherwise
 * from the workflow event: the payload number for `pull_request`, and the
 * synthetic `HEAD_REF` for `merge_group`, whose payload names no pull request.
 */
@Injectable()
export class PullRequestContextService {
  // 🏗 Dependency Injection

  constructor(
    private readonly pullRequestGithubService: PullRequestGithubService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Parses the `gh api` document, or says why it could not be used. */
  private parseContext(
    output: string,
    number: string,
  ): PullRequestResult<PullRequestContext> {
    let response: unknown;

    try {
      response = JSON.parse(output) as unknown;
    } catch (error) {
      return {
        failure: `❌ Unable to parse pull request ${number} context: ${error instanceof Error ? error.message : String(error)}`,
        ok: false,
      };
    }

    const context = pullRequestContextSchema.safeParse(response);

    if (!context.success) {
      return {
        failure: `❌ Invalid pull request ${number} context: ${context.error.message}`,
        ok: false,
      };
    }

    if (String(context.data.number) !== number) {
      return {
        failure: `❌ GitHub returned pull request ${String(context.data.number)} when ${number} was requested`,
        ok: false,
      };
    }

    return {
      ok: true,
      value: { ...context.data, body: context.data.body ?? "" },
    };
  }

  // 🌎 Public Methods

  /** Reads one pull request's title, body, author, labels, and assignees. */
  public fetch(number: string): PullRequestResult<PullRequestContext> {
    const result = this.pullRequestGithubService.run([
      "api",
      `repos/{owner}/{repo}/pulls/${number}`,
      "--jq",
      PULL_REQUEST_CONTEXT_QUERY,
    ]);

    if (!result.succeeded) {
      return {
        failure: `❌ Unable to read pull request ${number}: ${this.pullRequestGithubService.describeFailure(result)}`,
        ok: false,
      };
    }

    return this.parseContext(result.standardOutput, number);
  }

  /** Decides what this run is, from the arguments and the workflow event. */
  public resolveInvocation(
    passedParameters: readonly string[],
    environment: NodeJS.ProcessEnv,
  ): PullRequestResult<PullRequestInvocation> {
    const eventName = environment["GITHUB_EVENT_NAME"] ?? "";
    const [argument, mode, ...surplus] = passedParameters;
    const usage = USAGE_LINES.join("\n");

    if (
      surplus.length > 0 ||
      (mode !== undefined && (mode !== "write" || argument === undefined))
    ) {
      return {
        failure: `❌ Expected a number and optionally "write"\n${usage}`,
        ok: false,
      };
    }

    if (argument !== undefined) {
      return PULL_REQUEST_NUMBER_PATTERN.test(argument)
        ? {
            ok: true,
            value: {
              eventName,
              number: argument,
              writable:
                eventName === MERGE_GROUP_EVENT ? false : mode === "write",
            },
          }
        : {
            failure: `❌ Not a pull request number: ${argument}\n${usage}`,
            ok: false,
          };
    }

    if (eventName === MERGE_GROUP_EVENT) {
      const headReference = environment["HEAD_REF"] ?? "";
      const number = MERGE_GROUP_HEAD_REF_PATTERN.exec(headReference)?.[1];

      return number === undefined
        ? {
            failure: `❌ Unable to parse a pull request number from HEAD_REF (${headReference === "" ? "unset" : headReference})`,
            ok: false,
          }
        : { ok: true, value: { eventName, number, writable: false } };
    }

    if (eventName !== PULL_REQUEST_EVENT) {
      return {
        failure: `❌ Expected a number, or a pull_request or merge_group event, received ${eventName === "" ? "none" : eventName}\n${usage}`,
        ok: false,
      };
    }

    const number = environment["PULL_REQUEST_NUMBER"] ?? "";

    return PULL_REQUEST_NUMBER_PATTERN.test(number)
      ? { ok: true, value: { eventName, number, writable: true } }
      : {
          failure: "❌ Expected PULL_REQUEST_NUMBER to be a positive integer",
          ok: false,
        };
  }

  /** Publishes the number and author as step outputs, when there is a file. */
  public writeStepOutputs(
    context: PullRequestContext,
    environment: NodeJS.ProcessEnv,
  ): void {
    const outputPath = environment[GITHUB_OUTPUT_VARIABLE] ?? "";

    if (outputPath === "") {
      return;
    }

    appendFileSync(
      outputPath,
      `pull-request-number=${String(context.number)}\npull-request-author=${context.author}\n`,
      "utf8",
    );
  }
}
