import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { RENAME_BRANCH_DIRECTIVE } from "./session-branch-name.constants";
import { SessionBranchNameService } from "./session-branch-name.service";

/**
 * CLI command behind the branch-name session hook: does the checked-out
 * branch follow `<type>/<scope>-<description>`?
 *
 * Its standard output is the whole report and nothing else, so
 * `scripts/git/validate-session-branch-name.sh` can hand it to the agent as
 * context unchanged: silent with exit 0 for a compliant branch or no branch
 * at all, and otherwise the configured error — format, valid types, valid
 * scopes — and the rename-branch directive, with exit 1. It formats nothing
 * for any one agent harness; the hook's emitter does that.
 */
@Command({
  description:
    "Check that the checked-out branch follows the branch naming convention",
  name: "session-branch-name",
})
@Injectable()
export class SessionBranchNameCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly sessionBranchNameService: SessionBranchNameService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(SessionBranchNameCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Judges the branch, printing the report and setting exit code 1 when it
   * breaks the convention. The exit code is set rather than forced, so a
   * report written to a pipe is never cut off by an early exit.
   */
  async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const result = this.sessionBranchNameService.judgeCurrentBranch();

    if (result.kind !== "non-compliant") {
      return;
    }

    process.stdout.write(
      `${result.errorMessage.trim()}\n\n${RENAME_BRANCH_DIRECTIVE}`,
    );
    process.exitCode = 1;
  }
}
