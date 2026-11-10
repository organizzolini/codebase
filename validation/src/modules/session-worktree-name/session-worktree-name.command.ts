import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { USING_GIT_WORKTREES_DIRECTIVE } from "./session-worktree-name.constants";
import { SessionWorktreeNameService } from "./session-worktree-name.service";

/**
 * CLI command behind the worktree-name session hook: is the linked worktree
 * named in lowercase kebab-case, and gitignored when inside the main checkout?
 *
 * Its standard output is the report alone, which the hook hands to the agent.
 * Silent with exit 0 when nothing is wrong, otherwise every problem and the
 * directive, with exit 1.
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
   * Prints the worktree report and sets exit code 1 when the name breaks the
   * convention, without forcing an early exit.
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
