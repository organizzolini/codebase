import { spawnSync } from "node:child_process";

import { Injectable } from "@nestjs/common";

import { GITHUB_CLI_BINARY } from "./pull-request-issue.constants";

import type { GithubCliResult } from "./pull-request-issue.types";

/**
 * Runs the `gh` command-line client and reports what it produced.
 *
 * A near-identical helper lives beside the other pull request checks in this
 * project. That duplication is deliberate — see the comment on
 * `PullRequestMetadataGithubService` for why a shared abstraction is not worth
 * it for forty lines.
 *
 * Nothing here throws. This command reports on a pull request rather than
 * changing one, so a `gh` that is missing, unauthorized, or rate-limited is a
 * fact to report, not an exception to propagate.
 */
@Injectable()
export class PullRequestIssueGithubService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Whatever `gh` said about why it could not do the thing.
   *
   * Both streams, because which one carries the reason varies by subcommand,
   * and a failure reported with nothing to read is worse than a clumsy line.
   */
  public describeFailure(result: GithubCliResult): string {
    const output = [result.standardError, result.standardOutput.trim()]
      .filter((part) => part !== "")
      .join(" ");

    return output === "" ? "no output" : output;
  }

  /** Invokes `gh` with these arguments, capturing each stream on its own. */
  public run(commandArguments: readonly string[]): GithubCliResult {
    const completion = spawnSync(GITHUB_CLI_BINARY, [...commandArguments], {
      encoding: "utf8",
    });

    if (completion.error !== undefined) {
      return {
        available: false,
        standardError: completion.error.message,
        standardOutput: "",
        succeeded: false,
      };
    }

    return {
      available: true,
      standardError: completion.stderr.trim(),
      standardOutput: completion.stdout,
      succeeded: completion.status === 0,
    };
  }
}
