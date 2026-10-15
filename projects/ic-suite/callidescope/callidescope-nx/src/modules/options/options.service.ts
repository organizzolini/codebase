import {
  CALLIDESCOPE_OUTPUT_FORMATS,
  ConfigurationService,
} from "@callidescope/configuration";
import { Injectable } from "@nestjs/common";

import {
  DEFAULT_BREADTH_TARGET_NAME,
  DEFAULT_DEPTH_TARGET_NAME,
  DEFAULT_GATE_TARGET_NAME,
  DEFAULT_TRACE_TARGET_NAME,
  EXECUTOR_CONFIGURATION_SURFACE,
  PLUGIN_CONFIGURATION_SURFACE,
} from "./options.constants";

import type { CallidescopePluginOptions } from "./options.types";
import type { CallidescopeOutputFormat } from "@callidescope/configuration";

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

  /**
   * Reads the `configuration` option of an executor, refusing a missing one.
   *
   * Nx validates the option against `schema.json`, but a target written by hand
   * reaches an executor unchecked, so the same refusal the plugin option gets —
   * decided by the configuration layer — is applied here.
   */
  public readConfiguration(value: unknown): string {
    return this.configurationService.requireConfigurationPath(
      typeof value === "string" ? value : undefined,
      EXECUTOR_CONFIGURATION_SURFACE,
    );
  }

  /**
   * Narrows an untrusted output format to one callidescope renders.
   *
   * A target written by hand in a `project.json` bypasses the executor's
   * `schema.json` enum, so an unrecognized value falls back to whatever the
   * configuration chose rather than reaching the renderer.
   */
  public readFormat(value: unknown): CallidescopeOutputFormat | undefined {
    return CALLIDESCOPE_OUTPUT_FORMATS.find(
      (format): boolean => format === value,
    );
  }

  /**
   * Reads the two options every lookup executor shares, the configuration
   * path refused when missing and the format narrowed.
   */
  public readLookupOptions(options: {
    configuration: unknown;
    format?: unknown;
  }): {
    configurationPath: string;
    format: CallidescopeOutputFormat | undefined;
  } {
    return {
      configurationPath: this.readConfiguration(options.configuration),
      format: this.readFormat(options.format),
    };
  }

  /**
   * Reads a list of strings out of an executor's options.
   *
   * Nx validates an option against its `schema.json` before the executor sees
   * it, but a target written by hand in a `project.json` reaches here
   * unchecked, so a non-array or a list holding non-strings is narrowed rather
   * than trusted. Entries are trimmed and the blanks dropped, so a trailing
   * comma in `--projects a,b,` names two projects rather than three.
   */
  public readStringList(value: unknown): string[] {
    if (!this.isUnknownArray(value)) {
      return typeof value === "string" ? this.readStringList([value]) : [];
    }

    return value
      .filter((entry): entry is string => typeof entry === "string")
      .flatMap((entry) => entry.split(","))
      .map((entry) => entry.trim())
      .filter((entry) => entry !== "");
  }

  /**
   * Resolves the effective plugin options from an untrusted value.
   *
   * Every field has a default except `configurationPath`: the workspace
   * configuration is never searched for, so a registration that does not name
   * it is refused rather than guessed at.
   */
  public resolvePluginOptions(options: unknown): CallidescopePluginOptions {
    const record: Record<string, unknown> =
      typeof options === "object" && options !== null ? { ...options } : {};
    const configurationPath =
      this.configurationService.requireConfigurationPath(
        this.readString({ key: "configurationPath", options: record }),
        PLUGIN_CONFIGURATION_SURFACE,
      );

    return {
      breadthTargetName:
        this.readString({ key: "breadthTargetName", options: record }) ??
        DEFAULT_BREADTH_TARGET_NAME,
      configurationPath,
      depthTargetName:
        this.readString({ key: "depthTargetName", options: record }) ??
        DEFAULT_DEPTH_TARGET_NAME,
      gateTargetName:
        this.readString({ key: "gateTargetName", options: record }) ??
        DEFAULT_GATE_TARGET_NAME,
      traceTargetName:
        this.readString({ key: "traceTargetName", options: record }) ??
        DEFAULT_TRACE_TARGET_NAME,
    };
  }
}
