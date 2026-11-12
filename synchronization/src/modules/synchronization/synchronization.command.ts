import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { ConformetryGeneratorsCommand } from "../conformetry-generators/conformetry-generators.command";
import { ConventionalConfigCommand } from "../conventional-config/conventional-config.command";
import { DevcontainerConfigurationCommand } from "../devcontainer-configuration/devcontainer-configuration.command";
import { InstalledSkillsCommand } from "../installed-skills/installed-skills.command";
import { PackageManifestsCommand } from "../package-manifests/package-manifests.command";
import { PullRequestTemplateCommand } from "../pull-request-template/pull-request-template.command";
import { SkillExclusionsCommand } from "../skill-exclusions/skill-exclusions.command";
import { TypeormMigrationSqlCommand } from "../typeorm-migration-sql/typeorm-migration-sql.command";
import { VscodeExtensionsCommand } from "../vscode-extensions/vscode-extensions.command";

import { SynchronizationService } from "./synchronization.service";

import type {
  SynchronizableCommand,
  SynchronizationMode,
  SynchronizationResult,
} from "./synchronization.types";

/**
 * CLI command that runs every synchronization command in one process, for a human at a terminal.
 *
 * Workflows name each command's own Nx target instead. `nestjs-module-graphs` and `nx-project-graphs`
 * were removed, since `codependix` now produces those graphs; run `nx run configuration:codependix`.
 */
@Command({
  description: "Run every synchronization command",
  name: "synchronization",
})
@Injectable()
export class SynchronizationCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly conformetryGeneratorsCommand: ConformetryGeneratorsCommand,
    private readonly conventionalConfigCommand: ConventionalConfigCommand,
    private readonly devcontainerConfigurationCommand: DevcontainerConfigurationCommand,
    private readonly installedSkillsCommand: InstalledSkillsCommand,
    private readonly logger: LoggerService,
    private readonly packageManifestsCommand: PackageManifestsCommand,
    private readonly pullRequestTemplateCommand: PullRequestTemplateCommand,
    private readonly skillExclusionsCommand: SkillExclusionsCommand,
    private readonly synchronizationModeService: SynchronizationService,
    private readonly typeormMigrationSqlCommand: TypeormMigrationSqlCommand,
    private readonly vscodeExtensionsCommand: VscodeExtensionsCommand,
  ) {
    super();
    this.logger.setContext(SynchronizationCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Lists the commands the aggregate drives. `vscode-settings` needs a
   * devcontainer and `project-ports` rewrites authored ports, so both run only
   * by name.
   */
  private getCommands(): SynchronizableCommand[] {
    return [
      this.conformetryGeneratorsCommand,
      this.conventionalConfigCommand,
      this.devcontainerConfigurationCommand,
      this.installedSkillsCommand,
      this.packageManifestsCommand,
      this.pullRequestTemplateCommand,
      this.skillExclusionsCommand,
      this.typeormMigrationSqlCommand,
      this.vscodeExtensionsCommand,
    ];
  }

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
      hint: "Run the failing command's own `:write` Nx target to fix it",
      total: results.length,
    });
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
          "💡 Usage: nx run synchronization:start (or synchronization:start:write)",
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
    const commands = this.getCommands();
    const results: SynchronizationResult[] = [];

    for (const command of commands) {
      this.logger.info("🔄 Synchronizing a command", undefined, {
        label: command.synchronizationLabel,
      });
      results.push({
        label: command.synchronizationLabel,
        succeeded: await command.synchronize(mode),
      });
    }

    this.reportResults(mode, results);

    return results.every((result) => result.succeeded);
  }
}
