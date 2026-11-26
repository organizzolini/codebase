import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { SynchronizationService } from "../../synchronization.service";

import { AgentInstructionsService } from "./agent-instructions.service";

import type {
  SynchronizableCommand,
  SynchronizationMode,
} from "../../synchronization.types";

/**
 * CLI command that keeps a `CLAUDE.md` symlink beside every project's
 * `AGENTS.md`, so Claude Code loads the project's instructions.
 *
 * `check` fails when a project lacks the link; `write` creates it.
 */
@Command({
  description: "Check or write a CLAUDE.md link beside every project AGENTS.md",
  name: "agent-instructions",
})
@Injectable()
export class AgentInstructionsCommand
  extends CommandRunner
  implements SynchronizableCommand
{
  // 🏗 Dependency Injection

  constructor(
    private readonly agentInstructionsService: AgentInstructionsService,
    private readonly logger: LoggerService,
    private readonly synchronizationService: SynchronizationService,
  ) {
    super();
    this.logger.setContext(AgentInstructionsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  readonly fixCommand = "pnpm exec nx run integration:agent-instructions:write";

  readonly synchronizationLabel = "agent-instructions";

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Runs the derivation in check or write mode and exits 0 or 1 on the verdict. */
  public async run(passedParameters: string[]): Promise<void> {
    const mode = this.synchronizationService.resolveSynchronizationModeOrExit({
      invalidModeLabel: "Unknown mode",
      loggerService: this.logger,
      passedParameters,
      usageMessage: "Expected 'check' or 'write'",
    });

    if (!(await this.synchronize(mode))) {
      process.exit(1);
    }
  }

  /** Checks or writes every project's link and reports whether all are in place. */
  public async synchronize(mode: SynchronizationMode): Promise<boolean> {
    // Nothing here is asynchronous; the contract's signature is.
    await Promise.resolve();

    const workspaceRoot = process.cwd();
    const unlinked =
      this.agentInstructionsService.findUnlinkedProjects(workspaceRoot);

    if (unlinked.length === 0) {
      this.logger.log("🔗 Verified the CLAUDE.md links", undefined, {});

      return true;
    }

    if (mode === "check") {
      this.logger.log(
        "🔗 Detected projects with no CLAUDE.md link",
        undefined,
        {
          hint: `Run '${this.fixCommand}' to create them`,
          projects: unlinked,
        },
      );

      return false;
    }

    const { refused } = this.agentInstructionsService.linkProjects(
      workspaceRoot,
      unlinked,
    );

    if (refused.length > 0) {
      this.logger.error(
        "🚧 Refused to replace a CLAUDE.md that is a regular file",
        undefined,
        { projects: refused },
      );

      return false;
    }

    this.logger.log("🔗 Linked CLAUDE.md to AGENTS.md", undefined, {
      projects: unlinked,
    });

    return true;
  }
}
