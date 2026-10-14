import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { USING_GIT_WORKTREES_DIRECTIVE } from "./session-worktree-name.constants";
import { SessionWorktreeNameService } from "./session-worktree-name.service";

/**
 * CLI command behind the worktree-name session hook: is the linked worktree
 * this runs in named in lowercase kebab-case, and gitignored when it sits
 * inside the main checkout?
 *
 * Its standard output is the whole report and nothing else, so
 * `scripts/git/validate-session-worktree-name.sh` can hand it to the agent as
 * context unchanged: silent with exit 0 when nothing is wrong or nothing is
 * judged, and otherwise every problem and the using-git-worktrees directive,
 * with exit 1. It formats nothing for any one agent harness; the hook's
 * emitter does that.
 */
@Command({
  description:
    "Check that the linked worktree follows the worktree naming convention",
  name: "session-worktree-name",
})
@Injectable()
export class SessionWorktreeNameCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly sessionWorktreeNameService: SessionWorktreeNameService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(SessionWorktreeNameCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Judges the worktree, printing the report and setting exit code 1 when it
   * breaks the convention. The exit code is set rather than forced, so a
   * report written to a pipe is never cut off by an early exit.
   */
  async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const violations = this.sessionWorktreeNameService.findViolations();

    if (violations.length === 0) {
      return;
    }

    process.stdout.write(
      `${violations.join("\n\n")}\n${USING_GIT_WORKTREES_DIRECTIVE}`,
    );
    process.exitCode = 1;
  }
}
