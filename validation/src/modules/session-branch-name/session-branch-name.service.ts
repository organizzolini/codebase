import { createRequire } from "node:module";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { SessionBranchNameGitService } from "./session-branch-name-git.service";
import {
  BRANCH_NAME_CONFIG_PATH,
  branchNameConfigSchema,
  CURRENT_BRANCH_ARGUMENTS,
  ERROR_MESSAGE_FIELD,
} from "./session-branch-name.constants";

import type {
  BranchNameRules,
  SessionBranchNameResult,
} from "./session-branch-name.types";

/**
 * Judges the checked-out branch against `validate-branch-name.config.cjs`.
 *
 * The pattern and the error text both come from that file, read fresh from
 * the workspace root on every run, so this check says exactly what the
 * pre-push hook would and names the same types and scopes.
 */
@Injectable()
export class SessionBranchNameService {
  // 🏗 Dependency Injection

  constructor(private readonly gitService: SessionBranchNameGitService) {}

  // 🔐 Private Fields

  private readonly requireFromCurrentModule = createRequire(import.meta.url);

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The checked-out branch, or an empty string when there is none to ask about. */
  private readCurrentBranch(): string {
    const result = this.gitService.run(CURRENT_BRANCH_ARGUMENTS);

    return result.available && result.status === 0 ? result.stdout.trim() : "";
  }

  // 🌎 Public Methods

  /** Whether the checked-out branch follows the convention, if there is one. */
  public judgeCurrentBranch(): SessionBranchNameResult {
    const branch = this.readCurrentBranch();

    if (branch === "") {
      return { kind: "no-branch" };
    }

    const rules = this.readBranchNameRules();

    return rules.pattern.test(branch)
      ? { kind: "compliant" }
      : { errorMessage: rules.errorMessage, kind: "non-compliant" };
  }

  /**
   * Reads the pattern and error text, wherever `cwd` is.
   *
   * Throws when either is missing: a broken repository invariant this check
   * depends on, not a branch to report on.
   */
  public readBranchNameRules(): BranchNameRules {
    const configuration = branchNameConfigSchema.parse(
      this.requireFromCurrentModule(
        path.join(process.cwd(), BRANCH_NAME_CONFIG_PATH),
      ) as unknown,
    );

    return {
      errorMessage: configuration[ERROR_MESSAGE_FIELD],
      // No flags, as validate-branch-name compiles it, so an escape the
      // pre-push hook accepts never makes this check throw instead.
      pattern: new RegExp(configuration.pattern),
    };
  }
}
