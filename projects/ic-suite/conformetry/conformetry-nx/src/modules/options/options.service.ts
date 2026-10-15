import { Injectable } from "@nestjs/common";

import {
  CONFORMETRY_NX_PLUGIN_NAME,
  DEFAULT_VALIDATE_TARGET_NAME,
  MISSING_CONFIGURATION_PATH_MESSAGE,
  PLUGIN_OPTION_NAMES,
} from "./options.constants";

import type { ConformetryPluginOptions } from "./options.types";

/**
 * Narrows the untyped options object Nx hands a plugin.
 *
 * Nx passes whatever the consumer wrote in `nx.json` with no validation, so
 * every field is checked before use rather than cast. A bad value falls back
 * to its default: a typo in a target name should not stop the project graph
 * from being built.
 */
@Injectable()
export class OptionsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Narrows an untrusted value to an array without widening it to `any`. */
  private isUnknownArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  /** Reads a string field from an untrusted record, or `undefined`. */
  private readString(args: {
    key: string;
    options: Record<string, unknown>;
  }): string | undefined {
    const value = args.options[args.key];

    return typeof value === "string" && value !== "" ? value : undefined;
  }

  // 🌎 Public Methods

  /** Reads this plugin's `configurationPath` out of an `nx.json`, if it names one. */
  public readRegisteredConfigurationPath(
    nxConfiguration: unknown,
  ): string | undefined {
    if (typeof nxConfiguration !== "object" || nxConfiguration === null) {
      return undefined;
    }

    const { plugins }: { plugins?: unknown } = { ...nxConfiguration };

    if (!this.isUnknownArray(plugins)) {
      return undefined;
    }

    for (const entry of plugins) {
      if (typeof entry !== "object" || entry === null) {
        continue;
      }

      const { options, plugin }: { options?: unknown; plugin?: unknown } = {
        ...entry,
      };

      if (plugin !== CONFORMETRY_NX_PLUGIN_NAME) {
        continue;
      }

      return typeof options === "object" && options !== null
        ? this.readString({ key: "configurationPath", options: { ...options } })
        : undefined;
    }

    return undefined;
  }

  /**
   * Reads the configuration path the workspace registered, or refuses.
   *
   * Nx passes plugin options to `createNodes` and to executors, but not to a
   * global sync generator or to anything run outside Nx entirely, such as the
   * install-time bootstrap. Those read the registration themselves. No path is
   * assumed or searched for: a registration without one is an error naming the
   * option, because a guessed file is a silently wrong configuration.
   */
  public resolveConfigurationPath(args: { nxConfiguration: unknown }): string {
    const registered = this.readRegisteredConfigurationPath(
      args.nxConfiguration,
    );

    if (registered === undefined) {
      throw new Error(MISSING_CONFIGURATION_PATH_MESSAGE);
    }

    return registered;
  }

  /**
   * Extracts the generator inputs from an Nx options object.
   *
   * Nx hands a generator every option the consumer passed, including the ones
   * that configure this plugin rather than the generator. Those are dropped so
   * a template placeholder is never accidentally filled with a config path,
   * and non-string values are dropped because substitutions are text.
   */
  public resolveGeneratorInputs(
    options: unknown,
  ): Record<string, string | undefined> {
    if (typeof options !== "object" || options === null) {
      return {};
    }

    const inputs: Record<string, string | undefined> = {};

    for (const [key, value] of Object.entries({ ...options })) {
      if (PLUGIN_OPTION_NAMES.includes(key) || typeof value !== "string") {
        continue;
      }

      inputs[key] = value;
    }

    return inputs;
  }

  /**
   * Resolves the effective plugin options from an untrusted value.
   *
   * `configurationPath` is required and has no default; a missing one throws
   * an error naming the option and the plugin. `validateTargetName` falls back
   * to its default.
   */
  public resolvePluginOptions(options: unknown): ConformetryPluginOptions {
    const record: Record<string, unknown> =
      typeof options === "object" && options !== null ? { ...options } : {};
    const configurationPath = this.readString({
      key: "configurationPath",
      options: record,
    });

    if (configurationPath === undefined) {
      throw new Error(MISSING_CONFIGURATION_PATH_MESSAGE);
    }

    return {
      configurationPath,
      validateTargetName:
        this.readString({ key: "validateTargetName", options: record }) ??
        DEFAULT_VALIDATE_TARGET_NAME,
    };
  }
}
