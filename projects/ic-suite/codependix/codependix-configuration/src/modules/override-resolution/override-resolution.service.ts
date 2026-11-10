import { Injectable } from "@nestjs/common";

import { InputError } from "../input/input.constants";

import { buildUndeclaredOverrideMessage } from "./override-resolution.constants";

import type { ResolvedCodependixConfiguration } from "../configuration/configuration.types";
import type { ApplyOverridesArguments } from "./override-resolution.types";

/**
 * Applies strict, per-field CLI overrides to a resolved configuration. A flag may override a declared
 * value, and is refused for a field the configuration never declared. Kept apart from
 * `ConfigurationService` to keep that file within its length budget.
 */
@Injectable()
export class OverrideResolutionService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Refuses an override for a field the author never declared. Checked against the authored config,
   * since resolution fills defaults.
   */
  private resolveOverride(args: {
    authored: string[] | undefined;
    configured: string[];
    field: string;
    flag: string;
    override: string[] | undefined;
  }): string[] {
    const { authored, configured, field, flag, override } = args;

    if (override === undefined || override.length === 0) {
      return configured;
    }

    if (authored === undefined) {
      throw new InputError(buildUndeclaredOverrideMessage({ field, flag }));
    }

    return [...override];
  }

  // 🌎 Public Methods

  /**
   * Applies `--include`/`--exclude` on top of an already-resolved
   * configuration.
   */
  public applyOverrides(
    args: ApplyOverridesArguments,
  ): ResolvedCodependixConfiguration {
    const { authored, overrides, resolved } = args;

    if (overrides === undefined) {
      return resolved;
    }

    return {
      ...resolved,
      exclude: this.resolveOverride({
        authored: authored.exclude,
        configured: resolved.exclude,
        field: "exclude",
        flag: "--exclude",
        override: overrides.exclude,
      }),
      include: this.resolveOverride({
        authored: authored.include,
        configured: resolved.include,
        field: "include",
        flag: "--include",
        override: overrides.include,
      }),
    };
  }
}
