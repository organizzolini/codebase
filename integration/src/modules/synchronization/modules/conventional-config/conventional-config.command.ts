import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { SynchronizationService } from "../../synchronization.service";

import { ConventionalConfigService } from "./conventional-config.service";

import type {
  SynchronizableCommand,
  SynchronizationMode,
} from "../../synchronization.types";

/**
 * CLI command that runs the conventional-config sync in check or write mode.
 * Reads the mode from the first positional argument (check|write) and delegates
 * to the synchronization service, exiting with code 1 on drift.
 */
@Command({
  description: "Run the conventional-config command",
  name: "conventional-config",
})
@Injectable()
export class ConventionalConfigCommand
  extends CommandRunner
  implements SynchronizableCommand
{
  // 🏗 Dependency Injection

  constructor(
    private readonly conventionalConfigService: ConventionalConfigService,
    private readonly logger: LoggerService,
    private readonly synchronizationModeService: SynchronizationService,
  ) {
    super();
    this.logger.setContext(ConventionalConfigCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  readonly fixCommand =
    "pnpm exec nx run integration:conventional-config:write";

  readonly synchronizationLabel = "conventional-config";

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Runs the conventional-config sync command, delegating to helpers and exiting 1 on drift. */
  async run(
    passedParameters: string[],
    _options?: Record<string, unknown>,
  ): Promise<void> {
    const mode =
      this.synchronizationModeService.resolveSynchronizationModeOrExit({
        invalidModeLabel: "Invalid mode",
        loggerService: this.logger,
        passedParameters,
        usageMessage:
          "💡 Usage: nx run integration:conventional-config:check (or integration:conventional-config:write)",
      });

    if (!(await this.synchronize(mode))) {
      process.exit(1);
    }
  }

  /** Synchronizes conventional-commit config and reports success without exiting. */
  async synchronize(mode: SynchronizationMode): Promise<boolean> {
    await Promise.resolve();
    return this.conventionalConfigService.runSynchronization(mode);
  }
}
