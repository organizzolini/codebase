import { Injectable } from "@nestjs/common";

import {
  CHECK_LIMITS,
  CHECK_NAMES,
  CHECK_REPORTS,
  CHECK_SEPARATOR,
  ConfigurationPathRequiredError,
  FORMAT_MARKDOWN,
  FORMAT_NAMES,
} from "./configuration-flags.constants";

import type {
  CodometerFormat,
  MeasureCommandOptions,
  MeasureFormat,
  ModeSelection,
  RunMode,
} from "./configuration.types";

/**
 * Reads the command-line flags `ConfigurationService` answers a run from. Commander passes a valueless flag as `true` without calling its parser, so flags shared by several commands follow one rule; a flag only one command takes keeps its own parser.
 */
@Injectable()
export class ConfigurationFlagsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** States what `--check` accepts, in front of whatever went wrong. */
  private describeAcceptedCheckNames(problem: string): string {
    return `${problem}. It takes a comma-separated set drawn from ${CHECK_NAMES.map((name) => `"${name}"`).join(" and ")}, as in "--check ${CHECK_NAMES.join(CHECK_SEPARATOR)}".`;
  }

  /**
   * Reads `--check` into the set of checks to fail on. A valueless or empty `--check` is refused, never read as gating nothing.
   */
  private readCheckNames(
    value: string | true | undefined,
    errors: string[],
  ): Set<string> {
    if (value === undefined) {
      return new Set();
    }

    if (value === true) {
      errors.push(this.describeAcceptedCheckNames("--check needs a value"));
      return new Set();
    }

    const names = value
      .split(CHECK_SEPARATOR)
      .map((name) => name.trim())
      .filter((name) => name !== "");

    // An empty or comma-only value is refused like a valueless flag. Read as
    // gating nothing, an unset `$GATES` would pass forever against a stale report.
    if (names.length === 0) {
      errors.push(this.describeAcceptedCheckNames("--check needs a value"));
      return new Set();
    }

    return this.validateCheckNames(names, errors);
  }

  /** Keeps the names `--check` knows and complains about the rest. */
  private validateCheckNames(names: string[], errors: string[]): Set<string> {
    const accepted = new Set<string>();

    for (const name of names) {
      if (CHECK_NAMES.includes(name)) {
        accepted.add(name);
        continue;
      }

      errors.push(
        this.describeAcceptedCheckNames(`--check does not accept "${name}"`),
      );
    }

    return accepted;
  }

  // 🌎 Public Methods

  /**
   * Reads an option, returning `fallback` when it was left off. Each command chooses its own fallback.
   */
  public parseDefaultedOption(value: unknown, fallback: string): string {
    return this.parseOptionalOption(value) ?? fallback;
  }

  /**
   * Reads a directory option, falling back to the process's working directory as it stands when read.
   */
  public parseDirectoryOption(value: unknown): string {
    return this.parseDefaultedOption(value, process.cwd());
  }

  /**
   * Reads an option that carries text. Empty or valueless input counts as absent; the value is not trimmed, since a path's spaces matter.
   */
  public parseOptionalOption(value: unknown): string | undefined {
    return typeof value === "string" && value !== "" ? value : undefined;
  }

  /**
   * Returns the configuration path a run was given, or throws naming `surface`, the flag that should have carried it.
   */
  public requireConfigurationPath(
    value: string | undefined,
    surface: string,
  ): string {
    if (value === undefined || value.trim() === "") {
      throw new ConfigurationPathRequiredError(surface);
    }

    return value;
  }

  /**
   * Reads `--format`, falling back to the configuration's `format` when left off. Never inferred from other flags.
   */
  public resolveFormat(
    value: string | undefined,
    configuredFormat: CodometerFormat,
    errors: string[],
  ): MeasureFormat | undefined {
    if (value === undefined) {
      return configuredFormat;
    }

    const matched = FORMAT_NAMES.find((name) => name === value);

    if (matched === undefined) {
      errors.push(
        `--format does not accept "${value}". It takes one of ${FORMAT_NAMES.map((name) => `"${name}"`).join(" and ")}, as in "--format ${FORMAT_MARKDOWN}".`,
      );
    }

    return matched;
  }

  /**
   * Reads the flags into what the run writes and gates. `--check reports` is refused with `--output-*`, as a fresh report cannot be stale.
   */
  public selectMode(options: MeasureCommandOptions): ModeSelection {
    const errors: string[] = [];
    const names = this.readCheckNames(options.check, errors);
    const mode: RunMode = {
      checksLimits: names.has(CHECK_LIMITS),
      checksReports: names.has(CHECK_REPORTS),
      writesJson: options.outputJson !== undefined,
      writesMarkdown: options.outputMarkdown !== undefined,
    };

    if (mode.checksReports && (mode.writesJson || mode.writesMarkdown)) {
      errors.push(
        `--output-json or --output-markdown cannot be combined with --check ${CHECK_REPORTS}: a report cannot be stale in the run that just wrote it. Drop --check ${CHECK_REPORTS}, or run it separately from the run that writes.`,
      );
    }

    return { errors, mode };
  }
}
