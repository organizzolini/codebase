import { Injectable } from "@nestjs/common";

import {
  DEFAULT_CHECK_TARGET_NAME,
  DEFAULT_COMMAND,
} from "./options.constants";

import type { CoinageriePluginOptions } from "./options.types";

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

  /**
   * Reads a list of non-blank strings from an untrusted record.
   *
   * A non-list, or an entry that is not a string, is dropped rather than
   * trusted: one bad input must not discard the good ones beside it.
   */
  private readStringList(args: {
    key: string;
    options: Record<string, unknown>;
  }): string[] {
    const value = args.options[args.key];

    if (!this.isUnknownArray(value)) {
      return [];
    }

    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry !== "");
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
      inputs: this.readStringList({ key: "inputs", options: record }),
    };
  }
}
