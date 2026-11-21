import { spawnSync } from "node:child_process";

import { Injectable } from "@nestjs/common";

import { COMMITLINT_ARGUMENTS } from "./pull-request-title.constants";

/** Checks a pull request title against the Conventional Commits config. */
@Injectable()
export class PullRequestTitleService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every commitlint complaint about this title, one line each. */
  public check(title: string): string[] {
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
}
