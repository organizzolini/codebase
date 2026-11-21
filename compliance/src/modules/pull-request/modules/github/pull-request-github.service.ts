import { spawnSync } from "node:child_process";

import { Injectable } from "@nestjs/common";

import {
  GITHUB_CLI_BINARY,
  jsonListSchema,
} from "./pull-request-github.constants";

import type { GithubCliResult } from "./pull-request-github.types";

/**
 * Runs the `gh` command-line client and reports what it produced.
 *
 * Uses `gh` rather than an HTTP client: it resolves the repository and token
 * from the checkout, so every caller authenticates alike.
 *
 * Nothing here throws. A missing or rate-limited `gh` is reported, not raised.
 */
@Injectable()
export class PullRequestGithubService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Whatever `gh` said about why it could not do the thing.
   *
   * Both streams, since `gh` varies which one carries the reason.
   */
  public describeFailure(result: GithubCliResult): string {
    const output = `${result.standardError} ${result.standardOutput}`.trim();

    return output === "" ? "no output" : output;
  }

  /** Whether the `gh` binary can be executed at all. */
  public isAvailable(): boolean {
    return this.run(["--version"]).available;
  }

  /**
   * Every page of a repo-scoped list endpoint, flattened into one JSON array.
   * Reads through REST only, so it works where GraphQL is blocked.
   */
  public readList(endpoint: string): GithubCliResult {
    const result = this.run(["api", "--paginate", "--slurp", endpoint]);

    if (!result.succeeded) {
      return result;
    }

    try {
      const pages = jsonListSchema.safeParse(
        JSON.parse(result.standardOutput) as unknown,
      );
      const items = pages.success
        ? pages.data.flatMap((page) => {
            const list = jsonListSchema.safeParse(page);

            return list.success ? list.data : [];
          })
        : [];

      return { ...result, standardOutput: JSON.stringify(items) };
    } catch (error) {
      return {
        ...result,
        standardError: error instanceof Error ? error.message : String(error),
        succeeded: false,
      };
    }
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
