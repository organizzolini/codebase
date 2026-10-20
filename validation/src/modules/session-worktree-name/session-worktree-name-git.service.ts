import { spawnSync } from "node:child_process";

import { Injectable } from "@nestjs/common";

import type { GitResult } from "./session-worktree-name.types";

/**
 * Runs `git` in the workspace root.
 *
 * The one place this module starts a process, so its command tests can fake
 * `git` while the rest runs for real over a workspace on disk.
 */
@Injectable()
export class SessionWorktreeNameGitService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Runs `git` with these arguments in the current working directory.
   *
   * @param args - The arguments after `git`.
   * @returns Whether it could start, its exit status, and its standard output.
   */
  public run(args: readonly string[]): GitResult {
    const completion = spawnSync("git", [...args], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    // A `git` that never started leaves no standard output at all, not an
    // empty one, whatever the declared type says.
    if (completion.error !== undefined) {
      return { available: false, status: null, stdout: "" };
    }

    return {
      available: true,
      status: completion.status,
      stdout: completion.stdout,
    };
  }
}
