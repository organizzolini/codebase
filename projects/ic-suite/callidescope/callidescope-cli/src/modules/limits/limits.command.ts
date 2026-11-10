import { ConfigurationService } from "@callidescope/configuration";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { readRefusalHeadline } from "../callidescope/callidescope.constants";

import { LimitsService } from "./limits.service";
import { RenderLimitsService } from "./render-limits.service";

import type { LimitsCommandOptions } from "./limits.types";
import type { LogData } from "@codebase/observability";

/**
 * CLI entry point that lists each project's depth and breadth limits and the file each came from.
 *
 * A reading command: it touches no destination and fails on no limit.
 * Per-project limits are reviewable as one set.
 *
 * Prints the same rows as `codometer configuration --limits`.
 */
@Command({
  description:
    "List every project's resolved depth and breadth limits, and the file each came from",
  name: "limits",
})
@Injectable()
export class LimitsCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly limitsService: LimitsService,
    private readonly renderLimitsService: RenderLimitsService,
    private readonly configurationService: ConfigurationService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(LimitsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Logs one refusal under its headline and fails the run.
   * Shows a message, not a stack trace, since the cause is user input.
   */
  private reject(headline: string, data: LogData): void {
    this.logger.error(headline, undefined, data);
    process.exitCode = 1;
  }

  // 🌎 Public Methods

  /** Parses `--config`, which every command that loads a configuration requires. */
  @Option({
    description:
      "Path to the workspace callidescope configuration file (required)",
    flags: "--config <config>",
    required: true,
  })
  public parseConfig(value: string | undefined): string {
    return this.configurationService.requireConfigurationPath(
      value,
      "--config",
    );
  }

  /**
   * Prints every project's resolved limits to standard output, since nothing downstream reads it as a file.
   */
  public async run(
    _passedParameters: string[],
    options: LimitsCommandOptions,
  ): Promise<void> {
    try {
      const rows = await this.limitsService.list(options);

      process.stdout.write(`${this.renderLimitsService.render(rows)}\n`);
    } catch (error) {
      const headline = readRefusalHeadline(error);

      if (headline === undefined || !(error instanceof Error)) {
        throw error;
      }

      this.reject(headline, { reason: error.message });
    }
  }
}
