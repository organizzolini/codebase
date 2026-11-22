import { spawnSync } from "node:child_process";

import { Injectable } from "@nestjs/common";

import {
  COMMITLINT_ARGUMENTS,
  MAXIMUM_TITLE_SCOPES,
  TITLE_SCOPES_PATTERN,
  tooManyScopesMessage,
} from "./pull-request-title.constants";

/**
 * Checks a pull request title against the Conventional Commits config, and
 * against the limit on how many scopes it may name.
 */
@Injectable()
export class PullRequestTitleService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The one line that says a title names more scopes than the limit, or none. */
  private static checkScopeCount(title: string): string[] {
    const scopes = (TITLE_SCOPES_PATTERN.exec(title)?.[1] ?? "")
      .split(",")
      .map((scope) => scope.trim())
      .filter((scope) => scope !== "");

    return scopes.length > MAXIMUM_TITLE_SCOPES
      ? [tooManyScopesMessage(scopes)]
      : [];
  }

  /** Every commitlint complaint about this title, one line each. */
  private checkCommitlint(title: string): string[] {
    const completion = spawnSync("npx", [...COMMITLINT_ARGUMENTS], {
      encoding: "utf8",
      input: title,
    });

    if (completion.error !== undefined) {
      return [`❌ Unable to run commitlint: ${completion.error.message}`];
    }

    if (completion.status === 0) {
      return [];
    }

    const lines = `${completion.stdout}\n${completion.stderr}`
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    return lines.length === 0
      ? ["❌ Pull request title does not follow Conventional Commits"]
      : lines;
  }

  // 🌎 Public Methods

  /** Every complaint about this title, one line each. */
  public check(title: string): string[] {
    return [
      ...this.checkCommitlint(title),
      ...PullRequestTitleService.checkScopeCount(title),
    ];
  }
}
