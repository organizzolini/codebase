import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { RENAME_BRANCH_DIRECTIVE } from "./session-branch-name.constants";
import { SessionBranchNameService } from "./session-branch-name.service";

/**
 * CLI command behind the branch-name session hook: does the checked-out branch
 * follow `<type>/<scope>-<description>`?
 *
 * Its standard output is the report alone, which the hook hands to the agent.
 * Silent with exit 0 when compliant, or with no branch; otherwise the error and
 * the rename-branch directive, with exit 1.
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
   * Prints the branch report and sets exit code 1 when the branch breaks the
   * convention, without forcing an early exit.
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
