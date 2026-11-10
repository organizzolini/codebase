import { Injectable } from "@nestjs/common";

import {
  CALLIDESCOPE_OUTPUT_FORMATS,
  DEFAULT_EXCLUDE_GLOBS,
  DEFAULT_OUTPUT_FORMAT,
} from "../configuration/configuration.constants";

import {
  buildUndeclaredDestinationMessage,
  buildUndeclaredValueMessage,
  buildUnknownFormatMessage,
  buildUnknownSwitchMessage,
  buildUnreadableCountMessage,
} from "./flag-resolution.constants";

import type {
  CallidescopeLimitOverrides,
  CallidescopeOutputFormat,
  ResolvedCallidescopeConfiguration,
  ResolvedCallidescopeEntryPoints,
  ResolvedCallidescopeLimits,
  ResolvedCallidescopeWriteConfiguration,
} from "../configuration/configuration.types";
import type {
  CallidescopeRunFlags,
  ResolvedRunFlags,
} from "./flag-resolution.types";

/**
 * Combines a command line with the configuration it was resolved against.
 * A flag that changes what a run judges or writes may only override a value the configuration
 * already declares. Mode and presentation flags are command-line only.
 */
@Injectable()
export class FlagResolutionService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Reads one limit flag into the number it chose, or nothing. A refused value is never reported as an override.
   */
  private resolveCount(args: {
    configured: number | undefined;
    errors: string[];
    field: string;
    flag: string;
    flagged: string | undefined;
  }): number | undefined {
    if (args.flagged === undefined) {
      return undefined;
    }

    if (args.configured === undefined) {
      args.errors.push(
        buildUndeclaredValueMessage({ field: args.field, flag: args.flag }),
      );

      return undefined;
    }

    const count = Number(args.flagged);

    if (!Number.isInteger(count) || count <= 0) {
      args.errors.push(
        buildUnreadableCountMessage({ flag: args.flag, value: args.flagged }),
      );

      return undefined;
    }

    return count;
  }

  /**
   * Applies a path flag to one configured destination, keeping its heading, anchors, and hooks.
   * An undeclared destination is refused.
   */
  private resolveDestination<Destination extends { path: string }>(args: {
    configured: Destination | undefined;
    errors: string[];
    field: string;
    flag: string;
    flagged: string | undefined;
  }): Destination | undefined {
    if (args.flagged === undefined) {
      return args.configured;
    }

    if (args.configured === undefined) {
      args.errors.push(
        buildUndeclaredDestinationMessage({
          field: args.field,
          flag: args.flag,
        }),
      );

      return undefined;
    }

    return { ...args.configured, path: args.flagged };
  }

  /**
   * Applies the entry-point flags to the rules a run roots its stacks with.
   */
  private resolveEntryPoints(args: {
    configured: ResolvedCallidescopeEntryPoints;
    errors: string[];
    flags: CallidescopeRunFlags;
  }): ResolvedCallidescopeEntryPoints {
    const { configured, errors, flags } = args;

    return {
      addresses: this.resolveList({
        configured: configured.addresses,
        flagged: flags.entryPointAddresses,
      }),
      decorators: this.resolveList({
        configured: configured.decorators,
        flagged: flags.entryPointDecorators,
      }),
      includeExportedFunctions: this.resolveSwitch({
        configured: configured.includeExportedFunctions,
        errors,
        flag: "--include-exported-functions",
        flagged: flags.includeExportedFunctions,
      }),
      includeOrphans: this.resolveSwitch({
        configured: configured.includeOrphans,
        errors,
        flag: "--include-orphans",
        flagged: flags.includeOrphans,
      }),
      includeTests: this.resolveSwitch({
        configured: configured.includeTests,
        errors,
        flag: "--include-tests",
        flagged: flags.includeTests,
      }),
    };
  }

  /**
   * Reads `--exclude` over the globs no repository wants traced, never instead of them.
   * Replacing the defaults would trace `node_modules`.
   */
  private resolveExclude(args: {
    configured: string[];
    flagged: readonly string[] | undefined;
  }): string[] {
    if (args.flagged === undefined || args.flagged.length === 0) {
      return args.configured;
    }

    return [...new Set([...DEFAULT_EXCLUDE_GLOBS, ...args.flagged])];
  }

  // A deliberate misspelling: the example of a `--format` value nobody
  // recognizes, which is exactly what this refusal is about.
  // cspell:ignore mermiad
  /**
   * Reads `--format` into one of the formats a run can print. Anything else is refused rather than rewritten.
   */
  private resolveFormat(args: {
    errors: string[];
    flagged: string | undefined;
  }): CallidescopeOutputFormat {
    if (args.flagged === undefined) {
      return DEFAULT_OUTPUT_FORMAT;
    }

    const matched = CALLIDESCOPE_OUTPUT_FORMATS.find(
      (format) => format === args.flagged,
    );

    if (matched === undefined) {
      args.errors.push(buildUnknownFormatMessage(args.flagged));

      return DEFAULT_OUTPUT_FORMAT;
    }

    return matched;
  }

  /**
   * Reads the limit flags into the numbers they chose. Overrides stay apart from the merged
   * configuration, since a limit is enforced per project.
   */
  private resolveLimitOverrides(args: {
    configured: ResolvedCallidescopeLimits;
    errors: string[];
    flags: CallidescopeRunFlags;
  }): CallidescopeLimitOverrides {
    const { configured, errors, flags } = args;
    const overrides: CallidescopeLimitOverrides = {};
    const maximumBreadth = this.resolveCount({
      configured: configured.maximumBreadth,
      errors,
      field: "limits.maximumBreadth",
      flag: "--maximum-breadth",
      flagged: flags.maximumBreadth,
    });
    const maximumDepth = this.resolveCount({
      configured: configured.maximumDepth,
      errors,
      field: "limits.maximumDepth",
      flag: "--maximum-depth",
      flagged: flags.maximumDepth,
    });

    if (maximumBreadth !== undefined) {
      overrides.maximumBreadth = maximumBreadth;
    }

    if (maximumDepth !== undefined) {
      overrides.maximumDepth = maximumDepth;
    }

    return overrides;
  }

  /**
   * Applies the limit overrides to the numbers the run's own configuration declares.
   * An absent breadth limit is left off, not written as `undefined`.
   */
  private resolveLimits(args: {
    configured: ResolvedCallidescopeLimits;
    overrides: CallidescopeLimitOverrides;
  }): ResolvedCallidescopeLimits {
    const { configured, overrides } = args;
    const maximumBreadth =
      overrides.maximumBreadth ?? configured.maximumBreadth;
    const maximumDepth = overrides.maximumDepth ?? configured.maximumDepth;

    return maximumBreadth === undefined
      ? { maximumDepth }
      : { maximumBreadth, maximumDepth };
  }

  /**
   * Reads one list flag, preferring it over the configuration when it names anything.
   * An empty list counts as absent.
   */
  private resolveList(args: {
    configured: string[];
    flagged: readonly string[] | undefined;
  }): string[] {
    return args.flagged === undefined || args.flagged.length === 0
      ? args.configured
      : [...args.flagged];
  }

  /**
   * Reads one switch flag into the boolean it names. Anything but `true` or `false` is refused rather than coerced.
   */
  private resolveSwitch(args: {
    configured: boolean;
    errors: string[];
    flag: string;
    flagged: string | true | undefined;
  }): boolean {
    if (args.flagged === undefined) {
      return args.configured;
    }

    // The flag written with no value at all, which commander reports as its
    // own presence rather than as text. `--include-tests` on its own asks for
    // tests, the way every valueless switch on a command line does.
    if (args.flagged === true) {
      return true;
    }

    if (args.flagged === "true" || args.flagged === "false") {
      return args.flagged === "true";
    }

    args.errors.push(
      buildUnknownSwitchMessage({ flag: args.flag, value: args.flagged }),
    );

    return args.configured;
  }

  /** Applies the path flags to the destinations a run writes. */
  private resolveWrite(args: {
    configured: ResolvedCallidescopeWriteConfiguration;
    errors: string[];
    flags: CallidescopeRunFlags;
  }): ResolvedCallidescopeWriteConfiguration {
    const { configured, errors, flags } = args;

    return {
      json: this.resolveDestination({
        configured: configured.json,
        errors,
        field: "write.json",
        flag: "--json",
        flagged: flags.json,
      }),
      markdown: this.resolveDestination({
        configured: configured.markdown,
        errors,
        field: "write.markdown",
        flag: "--markdown",
        flagged: flags.markdown,
      }),
      mermaid: this.resolveDestination({
        configured: configured.mermaid,
        errors,
        field: "write.mermaid",
        flag: "--mermaid",
        flagged: flags.mermaid,
      }),
    };
  }

  // 🌎 Public Methods

  /**
   * Resolves a whole command line against one configuration. Every complaint is collected,
   * and nothing is traced or written by the time it returns.
   */
  public resolveRunFlags(args: {
    configuration: ResolvedCallidescopeConfiguration;
    flags: CallidescopeRunFlags;
  }): ResolvedRunFlags {
    const { configuration, flags } = args;
    const errors: string[] = [];
    const format = this.resolveFormat({ errors, flagged: flags.format });
    const limitOverrides = this.resolveLimitOverrides({
      configured: configuration.limits,
      errors,
      flags,
    });

    return {
      configuration: {
        ...configuration,
        directories: this.resolveList({
          configured: configuration.directories,
          flagged: flags.directories,
        }),
        entryPoints: this.resolveEntryPoints({
          configured: configuration.entryPoints,
          errors,
          flags,
        }),
        exclude: this.resolveExclude({
          configured: configuration.exclude,
          flagged: flags.exclude,
        }),
        excludeCallees: this.resolveList({
          configured: configuration.excludeCallees,
          flagged: flags.excludeCallees,
        }),
        limits: this.resolveLimits({
          configured: configuration.limits,
          overrides: limitOverrides,
        }),
        write: this.resolveWrite({
          configured: configuration.write,
          errors,
          flags,
        }),
      },
      errors,
      format,
      limitOverrides,
    };
  }
}
