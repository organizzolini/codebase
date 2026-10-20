import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import JSON5 from "json5";
import _ from "lodash";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { SynchronizationService } from "../synchronization/synchronization.service";

import {
  VSCODE_MACHINE_SETTINGS_DIRECTORY,
  VSCODE_MACHINE_SETTINGS_FILE,
  VSCODE_WORKSPACE_SETTINGS_FILE,
} from "./vscode-settings.constants";

import type {
  SynchronizableCommand,
  SynchronizationMode,
} from "../synchronization/synchronization.types";
import type {
  VscodeSettings,
  VscodeSettingsDrift,
} from "./vscode-settings.types";

/**
 * CLI command that merges `.vscode/settings.json` into the VS Code Machine
 * settings. Machine settings persist across devcontainer rebuilds and apply as
 * the lowest-priority layer, so keys that devcontainer features injected are
 * preserved and workspace settings win on conflict.
 * Runs in check (default) or write mode based on the first positional argument.
 */
@Command({
  description: "Run the vscode-settings command",
  name: "vscode-settings",
})
@Injectable()
export class VscodeSettingsCommand
  extends CommandRunner
  implements SynchronizableCommand
{
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly synchronizationModeService: SynchronizationService,
  ) {
    super();
    this.logger.setContext(VscodeSettingsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  readonly synchronizationLabel = "vscode-settings";

  // 🔏 Private Methods

  /** Finds the workspace keys the Machine settings lack or hold differently. */
  private findDrift(
    workspace: VscodeSettings,
    machine: VscodeSettings,
  ): VscodeSettingsDrift {
    const missingKeys: string[] = [];
    const mismatchedKeys: string[] = [];

    for (const key of Object.keys(workspace)) {
      if (!(key in machine)) missingKeys.push(key);
      else if (!_.isEqual(machine[key], workspace[key])) {
        mismatchedKeys.push(key);
      }
    }

    return { mismatchedKeys, missingKeys };
  }

  /** Reads the Machine settings, which do not exist until something writes them. */
  private readMachineSettings(): VscodeSettings {
    if (!existsSync(VSCODE_MACHINE_SETTINGS_FILE)) return {};

    return JSON5.parse<VscodeSettings>(
      readFileSync(VSCODE_MACHINE_SETTINGS_FILE, "utf8"),
    );
  }

  /** Merges the workspace settings over the Machine settings and writes the result. */
  private write(workspace: VscodeSettings, machine: VscodeSettings): void {
    mkdirSync(VSCODE_MACHINE_SETTINGS_DIRECTORY, { recursive: true });
    writeFileSync(
      VSCODE_MACHINE_SETTINGS_FILE,
      `${JSON.stringify({ ...machine, ...workspace }, null, 2)}\n`,
      "utf8",
    );
  }

  // 🌎 Public Methods

  /** Runs the vscode-settings sync command in check or write mode. */
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
          "💡 Usage: nx run synchronization:vscode-settings:check (or synchronization:vscode-settings:write)",
      });

    if (!(await this.synchronize(mode))) {
      process.exit(1);
    }
  }

  /** Synchronizes the Machine settings and reports success without exiting. */
  async synchronize(mode: SynchronizationMode): Promise<boolean> {
    try {
      await Promise.resolve();

      const workspace = JSON5.parse<VscodeSettings>(
        readFileSync(
          path.join(process.cwd(), VSCODE_WORKSPACE_SETTINGS_FILE),
          "utf8",
        ),
      );
      const machine = this.readMachineSettings();
      const drift = this.findDrift(workspace, machine);

      if (drift.missingKeys.length === 0 && drift.mismatchedKeys.length === 0) {
        this.logger.info(
          "📦 Verified the Machine settings against the workspace settings",
        );
        return true;
      }

      if (mode === "write") {
        this.write(workspace, machine);
        this.logger.info("📦 Updated the Machine settings", undefined, {
          file: VSCODE_MACHINE_SETTINGS_FILE,
        });
        return true;
      }

      this.logger.info("📦 Detected out-of-sync Machine settings", undefined, {
        hint: "Run: nx run synchronization:vscode-settings:write",
        mismatchedKeys: drift.mismatchedKeys,
        missingKeys: drift.missingKeys,
      });
      return false;
    } catch (error) {
      this.logger.error(
        "💥 Failed synchronizing the VS Code Machine settings",
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
