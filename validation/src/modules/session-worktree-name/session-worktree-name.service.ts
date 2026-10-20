import path from "node:path";

import { Injectable } from "@nestjs/common";

import { SessionWorktreeNameGitService } from "./session-worktree-name-git.service";
import {
  describeInvalidName,
  describeUnignoredWorktree,
  GIT_COMMON_DIRECTORY_ARGUMENTS,
  GIT_DIRECTORY_ARGUMENTS,
  SUPERPROJECT_ARGUMENTS,
  WORKTREE_DIRECTORY_NAME_PATTERN,
} from "./session-worktree-name.constants";

import type { LinkedWorktree } from "./session-worktree-name.types";

/**
 * Judges the linked worktree the current directory is the root of.
 *
 * Only a linked worktree is judged. The main checkout, a submodule, and a
 * directory outside a repository have nothing to answer for, and neither
 * does a machine without `git`.
 */
@Injectable()
export class SessionWorktreeNameService {
  // 🏗 Dependency Injection

  constructor(private readonly gitService: SessionWorktreeNameGitService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The linked worktree the current directory is the root of, or undefined
   * when it is not one.
   *
   * A linked worktree's git directory sits under the shared one's `worktrees`
   * folder, while the main checkout's is the shared one itself; the main
   * checkout is the shared git directory's parent.
   */
  private findLinkedWorktree(): LinkedWorktree | undefined {
    if (this.readGit(SUPERPROJECT_ARGUMENTS) !== "") {
      return undefined;
    }

    const root = process.cwd();
    const gitDirectory = this.readGit(GIT_DIRECTORY_ARGUMENTS);
    const commonDirectory = this.readGit(GIT_COMMON_DIRECTORY_ARGUMENTS);

    if (gitDirectory === "" || commonDirectory === "") {
      return undefined;
    }

    const absoluteCommonDirectory = path.resolve(root, commonDirectory);

    if (path.resolve(root, gitDirectory) === absoluteCommonDirectory) {
      return undefined;
    }

    const mainCheckoutRoot = path.dirname(absoluteCommonDirectory);

    return mainCheckoutRoot === root ? undefined : { mainCheckoutRoot, root };
  }

  /** Whether git ignores this worktree, asked from the main checkout. */
  private isIgnored(worktree: LinkedWorktree): boolean {
    const result = this.gitService.run([
      "-C",
      worktree.mainCheckoutRoot,
      "check-ignore",
      "-q",
      worktree.root,
    ]);

    return result.available && result.status === 0;
  }

  /** What `git` printed, trimmed, or an empty string when it failed. */
  private readGit(args: readonly string[]): string {
    const result = this.gitService.run(args);

    return result.available && result.status === 0 ? result.stdout.trim() : "";
  }

  // 🌎 Public Methods

  /**
   * Every way the current worktree breaks the convention: a directory name
   * that is not lowercase kebab-case, then, for one inside the main checkout,
   * not being gitignored. Empty when nothing is wrong or nothing is judged.
   */
  public findViolations(): string[] {
    const worktree = this.findLinkedWorktree();

    if (worktree === undefined) {
      return [];
    }

    const violations: string[] = [];
    const name = path.basename(worktree.root);

    if (!WORKTREE_DIRECTORY_NAME_PATTERN.test(name)) {
      violations.push(describeInvalidName(name));
    }

    const isInsideMainCheckout = worktree.root.startsWith(
      `${worktree.mainCheckoutRoot}${path.sep}`,
    );

    if (isInsideMainCheckout && !this.isIgnored(worktree)) {
      violations.push(describeUnignoredWorktree(worktree.root));
    }

    return violations;
  }
}
