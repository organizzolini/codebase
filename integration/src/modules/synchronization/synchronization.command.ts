import { Inject, Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { SYNCHRONIZABLE_COMMANDS } from "./synchronization.constants";
import { SynchronizationService } from "./synchronization.service";

import type {
  SynchronizableCommand,
  SynchronizationMode,
  SynchronizationResult,
} from "./synchronization.types";

/**
 * CLI command that runs every check and derivation in one process, for a human at a terminal.
 *
 * Workflows name each command's own Nx target instead.
 */
@Command({
  description: "Run every integration check",
  name: "synchronization",
})
@Injectable()
export class SynchronizationCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    @Inject(SYNCHRONIZABLE_COMMANDS)
    private readonly commands: SynchronizableCommand[],
    private readonly logger: LoggerService,
    private readonly synchronizationModeService: SynchronizationService,
  ) {
    super();
    this.logger.setContext(SynchronizationCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Logs a one-line-per-command summary of the run. */
  private reportResults(
    mode: SynchronizationMode,
    results: SynchronizationResult[],
  ): void {
    const failed = results.filter((result) => !result.succeeded);

    this.logger.info("📋 Summarized the synchronization run", undefined, {
      failed: results.filter((result) => !result.succeeded).map((r) => r.label),
      mode,
      succeeded: results
        .filter((result) => result.succeeded)
        .map((r) => r.label),
    });

    if (failed.length === 0) {
      this.logger.info("🔗 Verified every synchronization", undefined, {
        count: results.length,
      });
      return;
    }

    this.logger.info("🔗 Detected out-of-sync synchronizations", undefined, {
      count: failed.length,
      fixes: Object.fromEntries(failed.map((r) => [r.label, r.fix])),
      total: results.length,
    });
  }

  /** Runs one command, counting a throw as that command's failure. */
  private async runCommand(
    command: SynchronizableCommand,
    mode: SynchronizationMode,
  ): Promise<boolean> {
    try {
      return await command.synchronize(mode);
    } catch (error) {
      this.logger.error("💥 Failed to synchronize a command", undefined, {
        label: command.synchronizationLabel,
        message: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  // 🌎 Public Methods

  /** Runs every synchronization, exiting once if any reported drift. */
  async run(passedParameters: string[]): Promise<void> {
    const mode =
      this.synchronizationModeService.resolveSynchronizationModeOrExit({
        invalidModeLabel: "Invalid mode",
        loggerService: this.logger,
        passedParameters,
        usageMessage:
          "💡 Usage: nx run integration:start (or integration:start:write)",
      });

    if (!(await this.synchronize(mode))) {
      process.exit(1);
    }
  }

  /**
   * Runs every command in sequence, even after a failure, so one run surfaces
   * all drift. Not parallel: several write to AGENTS.md.
   */
  async synchronize(mode: SynchronizationMode): Promise<boolean> {
    const results: SynchronizationResult[] = [];

    for (const command of this.commands) {
      this.logger.info("🔄 Synchronizing a command", undefined, {
        label: command.synchronizationLabel,
      });
      results.push({
        fix:
          command.fixCommand ??
          `pnpm exec nx run integration:${command.synchronizationLabel}`,
        label: command.synchronizationLabel,
        succeeded: await this.runCommand(command, mode),
      });
    }

    this.reportResults(mode, results);

    return results.every((result) => result.succeeded);
  }
}
