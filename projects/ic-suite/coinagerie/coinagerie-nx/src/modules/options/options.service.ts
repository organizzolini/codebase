import { Injectable } from "@nestjs/common";

import {
  DEFAULT_CHECK_TARGET_NAME,
  DEFAULT_COMMAND,
} from "./options.constants";

import type { CoinageriePluginOptions, PluginInput } from "./options.types";

/**
 * Narrows the untyped options object Nx hands a plugin.
 *
 * Nx passes consumer config from `nx.json` unvalidated, so each field is checked
 * before use. A bad value falls back to its default, so a target-name typo does
 * not stop the project graph from building.
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

  /** Resolves the effective plugin options from an untrusted value. */
  public resolvePluginOptions(options: unknown): CoinageriePluginOptions {
    const record: Record<string, unknown> =
      typeof options === "object" && options !== null ? { ...options } : {};

    return {
      checkTargetName:
        this.readString({ key: "checkTargetName", options: record }) ??
        DEFAULT_CHECK_TARGET_NAME,
      command:
        this.readString({ key: "command", options: record }) ?? DEFAULT_COMMAND,
      inputs: this.readInputs(record),
    };
  }
}
