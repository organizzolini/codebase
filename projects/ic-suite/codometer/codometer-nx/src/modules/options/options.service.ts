import { ConfigurationPathRequiredError } from "@codometer/configuration";
import { Injectable } from "@nestjs/common";

import {
  DEFAULT_COMMAND,
  DEFAULT_LIMIT_TARGET_NAME,
  DEFAULT_WEIGH_TARGET_NAME,
} from "./options.constants";

import type { CodometerPluginOptions, PluginInput } from "./options.types";

/**
 * Narrows the unvalidated options object Nx hands a plugin from `nx.json`.
 *
 * A bad name falls back to its default, so a typo never stops the project graph;
 * a missing configuration path does, since nothing may assume where one lives.
 */
@Injectable()
export class OptionsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Narrows an untrusted value to an Nx input object, such as `{ env }`. */
  private isInputObject(value: unknown): value is Exclude<PluginInput, string> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  /** Narrows an untrusted value to an array without widening it to `any`. */
  private isUnknownArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  /**
   * Reads inputs from an untrusted record. Nx input objects pass whole, so a
   * cached verdict cannot outlive what it tracks; junk is dropped.
   */
  private readInputs(options: Record<string, unknown>): PluginInput[] {
    const value = options["inputs"];

    if (!this.isUnknownArray(value)) {
      return [];
    }

    return value.flatMap((entry): PluginInput[] => {
      if (this.isInputObject(entry)) {
        return [entry];
      }

      const trimmed = typeof entry === "string" ? entry.trim() : "";

      return trimmed === "" ? [] : [trimmed];
    });
  }

  /** Reads a non-blank string field from an untrusted record. */
  private readString(args: {
    key: string;
    options: Record<string, unknown>;
  }): string | undefined {
    const value = args.options[args.key];

    return typeof value === "string" && value.trim() !== ""
      ? value.trim()
      : undefined;
  }

  // 🌎 Public Methods

  /**
   * Resolves the effective plugin options from an untrusted value, throwing
   * when the registration names no `projectConfigurationPath`.
   */
  public resolvePluginOptions(options: unknown): CodometerPluginOptions {
    const record: Record<string, unknown> =
      typeof options === "object" && options !== null ? { ...options } : {};

    const projectConfigurationPath = this.readString({
      key: "projectConfigurationPath",
      options: record,
    });

    if (projectConfigurationPath === undefined) {
      throw new ConfigurationPathRequiredError(
        "The @codometer/nx plugin option projectConfigurationPath",
      );
    }

    return {
      command:
        this.readString({ key: "command", options: record }) ?? DEFAULT_COMMAND,
      inputs: this.readInputs(record),
      limitConfigurationPath: this.readString({
        key: "limitConfigurationPath",
        options: record,
      }),
      limitTargetName:
        this.readString({ key: "limitTargetName", options: record }) ??
        DEFAULT_LIMIT_TARGET_NAME,
      projectConfigurationPath,
      weighTargetName:
        this.readString({ key: "weighTargetName", options: record }) ??
        DEFAULT_WEIGH_TARGET_NAME,
    };
  }
}
