import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { USING_GIT_WORKTREES_DIRECTIVE } from "./session-worktree-name.constants";
import { SessionWorktreeNameService } from "./session-worktree-name.service";

/**
 * CLI command behind the worktree-name session hook.
 *
 * Checks the linked worktree is lowercase kebab-case and gitignored inside the
 * main checkout. Standard output is the report alone, which the hook passes on.
 * Exits 1 with every problem; silent with exit 0 otherwise.
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
