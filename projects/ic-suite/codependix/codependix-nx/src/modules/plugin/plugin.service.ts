import path from "node:path";

import { ConfigurationService } from "@codependix/configuration";
import { Injectable } from "@nestjs/common";

import {
  CODEPENDIX_NX_PLUGIN_NAME,
  DEFAULT_GATE_TARGET_NAME,
  PLUGIN_OPTION_SURFACE,
  PROJECT_CONFIGURATION_FILENAME,
  PROJECT_CONFIGURATION_INPUT,
  WORKSPACE_PROJECT_ROOT,
} from "./plugin.constants";

import type {
  CodependixPluginOptions,
  InferredTargets,
  InferTargetsArguments,
  ResolvePluginOptionsArguments,
} from "./plugin.types";

/**
 * Reads this plugin's registration and infers the gate from it. Every option is checked
 * before use, and a bad value falls back to its default rather than stopping the project graph.
 */
@Injectable()
export class PluginService {
  // 🏗 Dependency Injection

  constructor(private readonly configurationService: ConfigurationService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Narrows an untrusted value to an array without widening it to `any`. */
  private isUnknownArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  /** Reads a non-empty string field from an untrusted record. */
  private readString(args: {
    key: string;
    record: Record<string, unknown>;
  }): string | undefined {
    const value = args.record[args.key];

    return typeof value === "string" && value !== "" ? value : undefined;
  }

  /**
   * The project roots among the files Nx matched: each `project.json`'s
   * directory, the workspace root excepted.
   */
  private selectProjectRoots(
    projectConfigurationFiles: readonly string[],
  ): string[] {
    return projectConfigurationFiles
      .filter(
        (projectConfigurationFile) =>
          path.basename(projectConfigurationFile) ===
          PROJECT_CONFIGURATION_FILENAME,
      )
      .map((projectConfigurationFile) => path.dirname(projectConfigurationFile))
      .filter((projectRoot) => projectRoot !== WORKSPACE_PROJECT_ROOT);
  }

  /** Copies an untrusted value into a record, or an empty one. */
  private toRecord(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null ? { ...value } : {};
  }

  // 🌎 Public Methods

  /**
   * Builds the gate for every project Nx matched, keyed by project root. No `configurations` are
   * declared, so aggregator runs fall through.
   */
  public inferTargets(
    args: InferTargetsArguments,
  ): Map<string, InferredTargets> {
    const pluginOptions = this.resolvePluginOptions({
      options: args.options,
    });
    const targets: InferredTargets = {
      [pluginOptions.gateTargetName]: {
        cache: true,
        executor: `${CODEPENDIX_NX_PLUGIN_NAME}:gate`,
        inputs: [
          "default",
          "^default",
          `{workspaceRoot}/${pluginOptions.configurationPath}`,
          PROJECT_CONFIGURATION_INPUT,
          ...args.toolInputs,
        ],
        options: {},
      },
    };
    return new Map(
      this.selectProjectRoots(args.projectConfigurationFiles).map(
        (projectRoot) => [projectRoot, targets],
      ),
    );
  }

  /**
   * Returns this plugin's options from its `nx.json` entry. Nx passes them only to `createNodes`.
   */
  public readRegisteredOptions(nxConfiguration: unknown): unknown {
    const { plugins } = this.toRecord(nxConfiguration);

    if (!this.isUnknownArray(plugins)) {
      return undefined;
    }

    const registration = plugins
      .map((entry) => this.toRecord(entry))
      .find(({ plugin }) => plugin === CODEPENDIX_NX_PLUGIN_NAME);
    const { options } = registration ?? {};

    return options;
  }

  /**
   * Resolves plugin options from an untrusted value. `configurationPath` is required and never
   * searched for: a guess would cache gates across real edits.
   */
  public resolvePluginOptions(
    args: ResolvePluginOptionsArguments,
  ): CodependixPluginOptions {
    const record = this.toRecord(args.options);
    const configurationPath =
      this.configurationService.requireConfigurationPath(
        this.readString({ key: "configurationPath", record }),
        PLUGIN_OPTION_SURFACE,
      );

    return {
      configurationPath,
      gateTargetName:
        this.readString({ key: "gateTargetName", record }) ??
        DEFAULT_GATE_TARGET_NAME,
    };
  }
}
