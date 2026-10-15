import { ConfigurationService } from "@conformetry/configuration";
import { Injectable } from "@nestjs/common";

import {
  CONFORMETRY_NX_PLUGIN_NAME,
  DEFAULT_VALIDATE_TARGET_NAME,
  PLUGIN_OPTION_NAMES,
  PLUGIN_OPTION_SURFACE,
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

  constructor(private readonly configurationService: ConfigurationService) {}

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
   * Reads the configuration path the run was given, or refuses.
   *
   * The `configuration` option, when the caller has one, wins over the
   * workspace's registration. Whether a path is required, and what the refusal
   * says, belongs to the configuration layer; this only says which option the
   * person was meant to set.
   *
   * Nx passes plugin options to `createNodes` and to executors, but not to a
   * global sync generator or to anything run outside Nx entirely, such as the
   * install-time bootstrap. Those read the registration themselves. No path is
   * assumed or searched for.
   */
  public resolveConfigurationPath(args: {
    configuration?: string | undefined;
    nxConfiguration: unknown;
    surface?: string;
  }): string {
    return this.configurationService.requireConfigurationPath(
      args.configuration ??
        this.readRegisteredConfigurationPath(args.nxConfiguration),
      args.surface ?? PLUGIN_OPTION_SURFACE,
    );
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
   * `configurationPath` is required and has no default; a missing one is
   * refused by the configuration layer, naming `surface`. `validateTargetName`
   * falls back to its default.
   */
  public resolvePluginOptions(
    options: unknown,
    surface: string = PLUGIN_OPTION_SURFACE,
  ): ConformetryPluginOptions {
    const record: Record<string, unknown> =
      typeof options === "object" && options !== null ? { ...options } : {};

    return {
      configurationPath: this.configurationService.requireConfigurationPath(
        this.readString({ key: "configurationPath", options: record }),
        surface,
      ),
      validateTargetName:
        this.readString({ key: "validateTargetName", options: record }) ??
        DEFAULT_VALIDATE_TARGET_NAME,
    };
  }
}
