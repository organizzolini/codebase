import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import JSON5 from "json5";
import _ from "lodash";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { SynchronizationService } from "../synchronization/synchronization.service";

import {
  VSCODE_EXTENSIONS_DEVCONTAINER_FILES,
  VSCODE_EXTENSIONS_FILE,
} from "./vscode-extensions.constants";

import type {
  SynchronizableCommand,
  SynchronizationMode,
} from "../synchronization/synchronization.types";
import type {
  ExtensionListDifference,
  VscodeExtensionsDevcontainer,
  VscodeExtensionsFile,
} from "./vscode-extensions.types";

/**
 * CLI command that copies `.vscode/extensions.json` into both devcontainer
 * configurations: its recommendations become each one's `extensions` and
 * `recommendations`, and its unwanted recommendations are copied as they are.
 * Runs in check (default) or write mode based on the first positional argument.
 */
@Command({
  description: "Run the vscode-extensions command",
  name: "vscode-extensions",
})
@Injectable()
export class VscodeExtensionsCommand
  extends CommandRunner
  implements SynchronizableCommand
{
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly synchronizationModeService: SynchronizationService,
  ) {
    super();
    this.logger.setContext(VscodeExtensionsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  readonly synchronizationLabel = "vscode-extensions";

  // 🔏 Private Methods

  /** Whether two lists hold the same entries, in any order. */
  private hasSameEntries(left: string[], right: string[]): boolean {
    return _.isEqual(_.sortBy(left), _.sortBy(right));
  }

  /** Whether one devcontainer already holds every list the source declares. */
  private isCurrent(
    extensions: VscodeExtensionsFile,
    devcontainer: VscodeExtensionsDevcontainer,
  ): boolean {
    const {
      extensions: installed,
      recommendations,
      unwantedRecommendations,
    } = devcontainer.customizations.vscode;

    return (
      this.hasSameEntries(extensions.recommendations, installed) &&
      this.hasSameEntries(extensions.recommendations, recommendations) &&
      this.hasSameEntries(
        extensions.unwantedRecommendations,
        unwantedRecommendations,
      )
    );
  }

  /** Reads one devcontainer configuration. */
  private readDevcontainer(filePath: string): VscodeExtensionsDevcontainer {
    return JSON5.parse<VscodeExtensionsDevcontainer>(
      readFileSync(filePath, "utf8"),
    );
  }

  /** Logs every entry that differs between the source list and a devcontainer's list. */
  private reportDifferences(difference: ExtensionListDifference): void {
    const { actual, expected, list, relativeFilePath } = difference;

    if (this.hasSameEntries(expected, actual)) return;

    this.logger.info("🔀 Differing extension list", undefined, {
      extra: _.difference(actual, expected),
      list,
      missing: _.difference(expected, actual),
      relativeFilePath,
    });
  }

  /** Reports every list of one devcontainer that differs from the source. */
  private reportDrift(
    extensions: VscodeExtensionsFile,
    vscode: VscodeExtensionsDevcontainer["customizations"]["vscode"],
    relativeFilePath: string,
  ): void {
    this.logger.info("📦 Detected out-of-sync extensions", undefined, {
      hint: "Run: nx run synchronization:vscode-extensions:write",
      relativeFilePath,
    });
    this.reportDifferences({
      actual: vscode.extensions,
      expected: extensions.recommendations,
      list: "extensions",
      relativeFilePath,
    });
    this.reportDifferences({
      actual: vscode.recommendations,
      expected: extensions.recommendations,
      list: "recommendations",
      relativeFilePath,
    });
    this.reportDifferences({
      actual: vscode.unwantedRecommendations,
      expected: extensions.unwantedRecommendations,
      list: "unwantedRecommendations",
      relativeFilePath,
    });
  }

  /** Brings one devcontainer into line, or reports how it differs, and says whether it was current. */
  private synchronizeDevcontainer(
    mode: SynchronizationMode,
    extensions: VscodeExtensionsFile,
    relativeFilePath: string,
  ): boolean {
    const devcontainerFile = path.join(process.cwd(), relativeFilePath);
    const devcontainer = this.readDevcontainer(devcontainerFile);

    if (this.isCurrent(extensions, devcontainer)) return true;

    if (mode === "check") {
      this.reportDrift(
        extensions,
        devcontainer.customizations.vscode,
        relativeFilePath,
      );
      return false;
    }

    this.write(extensions, devcontainer, devcontainerFile);
    this.logger.info("📦 Updated the devcontainer extensions", undefined, {
      relativeFilePath,
    });
    return true;
  }

  /** Copies the source lists into one devcontainer file. */
  private write(
    extensions: VscodeExtensionsFile,
    devcontainer: VscodeExtensionsDevcontainer,
    devcontainerFile: string,
  ): void {
    devcontainer.customizations.vscode.extensions = extensions.recommendations;
    devcontainer.customizations.vscode.recommendations =
      extensions.recommendations;
    devcontainer.customizations.vscode.unwantedRecommendations =
      extensions.unwantedRecommendations;

    writeFileSync(
      devcontainerFile,
      `${JSON.stringify(devcontainer, null, 2)}\n`,
      "utf8",
    );
  }

  // 🌎 Public Methods

  /** Runs the vscode-extensions sync command in check or write mode. */
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
          "💡 Usage: nx run synchronization:vscode-extensions:check (or synchronization:vscode-extensions:write)",
      });

    if (!(await this.synchronize(mode))) {
      process.exit(1);
    }
  }

  /** Synchronizes both devcontainer extension lists and reports success without exiting. */
  async synchronize(mode: SynchronizationMode): Promise<boolean> {
    try {
      await Promise.resolve();

      const extensions = JSON5.parse<VscodeExtensionsFile>(
        readFileSync(path.join(process.cwd(), VSCODE_EXTENSIONS_FILE), "utf8"),
      );
      const results = VSCODE_EXTENSIONS_DEVCONTAINER_FILES.map((file) =>
        this.synchronizeDevcontainer(mode, extensions, file),
      );
      const inSync = results.every(Boolean);

      if (inSync) {
        this.logger.info(
          "📦 Verified the devcontainer extensions against .vscode/extensions.json",
        );
      }

      return inSync;
    } catch (error) {
      this.logger.error(
        "💥 Failed synchronizing the VS Code extensions",
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
