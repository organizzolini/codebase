import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ConfigurationFileNotFoundError,
  InvalidConfigurationError,
} from "@coinagerie/core";
import { Injectable } from "@nestjs/common";
import { createJiti } from "jiti";
import { z } from "zod";

import {
  CONFIGURATION_FILE_NAMES,
  CONFIGURATION_SCHEMA,
  DEFAULT_INCLUDE,
  FOLDED_WORD_SCHEMA,
  OVERRIDES_SCHEMA,
  WORD_LIST_SCHEMA,
} from "./configuration.constants";

import type {
  CoinagerieConfiguration,
  CoinagerieOutput,
  ConfigurationOverrides,
  ExcludedEntries,
  ExcludedWords,
  FoldWord,
  LoadConfigurationArguments,
  LoadedConfiguration,
  ResolvedCoinagerieConfiguration,
  ResolvedCoinagerieOutput,
} from "./configuration.types";

/**
 * Finds, reads, validates, and resolves a `coinagerie.config.ts`.
 *
 * The one place a configuration is interpreted: what leaves here has every
 * default filled in and every path made absolute, so nothing downstream has
 * to know how the run was configured.
 */
@Injectable()
export class ConfigurationService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** A caught value as text, whether or not it is an `Error`. */
  private describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Wraps the configured fold so its faults name the file, since it runs long after the file was read.
   */
  private guardFold(fold: FoldWord, location: string): FoldWord {
    return (word) => {
      let folded: unknown;

      try {
        folded = fold(word);
      } catch (error: unknown) {
        throw new InvalidConfigurationError(
          location,
          `fold threw on "${word}": ${this.describe(error)}`,
        );
      }

      const parsed = FOLDED_WORD_SCHEMA.safeParse(folded);

      if (!parsed.success) {
        throw new InvalidConfigurationError(
          location,
          `fold must return a non-empty string without whitespace or "*", but returned ${typeof folded === "string" ? JSON.stringify(folded) : `a value of type ${typeof folded}`} for "${word}"; it must be synchronous`,
        );
      }

      return parsed.data;
    };
  }

  /**
   * Reads the configuration file, or `undefined` for defaults. An unnamed file is
   * searched only in the working directory, never above it.
   */
  private locate(args: LoadConfigurationArguments): string | undefined {
    if (args.configurationPath !== undefined) {
      const namedPath = path.resolve(
        args.workingDirectory,
        args.configurationPath,
      );

      if (!existsSync(namedPath)) {
        throw new ConfigurationFileNotFoundError(namedPath);
      }

      return namedPath;
    }

    return CONFIGURATION_FILE_NAMES.map((name) =>
      path.join(args.workingDirectory, name),
    ).find((candidate) => existsSync(candidate));
  }

  /**
   * Applies command-line flags over the configuration; a given flag replaces its field.
   */
  private override(args: {
    configuration: CoinagerieConfiguration;
    flags: z.output<typeof OVERRIDES_SCHEMA>;
    workingDirectory: string;
  }): CoinagerieConfiguration {
    const { configuration, flags, workingDirectory } = args;
    const named: CoinagerieOutput[] = [
      ...(flags.outputJson === undefined
        ? []
        : [
            {
              path: path.resolve(workingDirectory, flags.outputJson),
              type: "json" as const,
            },
          ]),
      ...(flags.outputMarkdown === undefined
        ? []
        : [
            {
              path: path.resolve(workingDirectory, flags.outputMarkdown),
              type: "markdown" as const,
            },
          ]),
    ];
    const outputs = named.length > 0 ? named : (configuration.outputs ?? []);

    return {
      exclude: flags.excludePaths
        ? { ...configuration.exclude, paths: flags.excludePaths }
        : configuration.exclude,
      fold: configuration.fold,
      include: flags.include ?? configuration.include,
      outputs,
    };
  }

  /**
   * Imports and validates a configuration file, calling its `exclude.words`
   * function if it has one. Every failure names the file.
   */
  private async read(configurationPath: string): Promise<LoadedConfiguration> {
    let exported: unknown;

    try {
      const jiti = createJiti(fileURLToPath(import.meta.url));
      exported = await jiti.import(configurationPath, { default: true });
    } catch (error: unknown) {
      throw new InvalidConfigurationError(
        configurationPath,
        this.describe(error),
      );
    }

    const parsed = CONFIGURATION_SCHEMA.safeParse(exported);

    if (!parsed.success) {
      throw new InvalidConfigurationError(
        configurationPath,
        z.prettifyError(parsed.error),
      );
    }

    try {
      return {
        configuration: parsed.data,
        excluded: await this.resolveWords(parsed.data.exclude?.words),
      };
    } catch (error: unknown) {
      throw new InvalidConfigurationError(
        configurationPath,
        `exclude.words ${this.describe(error)}`,
      );
    }
  }

  /** Fills in every default and makes every path absolute. */
  private resolve(args: {
    configurationPath: string | undefined;
    directory: string;
    loaded: LoadedConfiguration;
    location: string;
    overrides: ConfigurationOverrides | undefined;
    workingDirectory: string;
  }): ResolvedCoinagerieConfiguration {
    const { directory, location } = args;
    const flags = OVERRIDES_SCHEMA.safeParse(args.overrides ?? {});

    // A flag the schema refuses is the command line's fault, not the file's.
    if (!flags.success) {
      throw new InvalidConfigurationError(
        "the command line",
        z.prettifyError(flags.error),
      );
    }

    const configuration = this.override({
      configuration: args.loaded.configuration,
      flags: flags.data,
      workingDirectory: args.workingDirectory,
    });

    const outputs: ResolvedCoinagerieOutput[] = [];
    const seen = new Set<string>();

    for (const output of configuration.outputs ?? []) {
      const absolutePath = path.resolve(directory, output.path);

      // Two destinations on one file would overwrite each other on every write.
      if (seen.has(absolutePath)) {
        throw new InvalidConfigurationError(
          args.configurationPath ?? "the command line",
          `Two outputs name ${absolutePath}, and each write would overwrite the other`,
        );
      }

      seen.add(absolutePath);
      outputs.push(
        output.type === "json"
          ? { path: absolutePath, type: "json" }
          : {
              description: flags.data.description ?? output.description,
              path: absolutePath,
              type: "markdown",
            },
      );
    }

    return {
      configurationPath: args.configurationPath,
      directory,
      exclude: {
        paths: configuration.exclude?.paths ?? [],
        patterns: args.loaded.excluded.patterns,
        words: args.loaded.excluded.words,
      },
      fold:
        configuration.fold === undefined
          ? undefined
          : this.guardFold(configuration.fold, location),
      include: configuration.include ?? [...DEFAULT_INCLUDE],
      outputs,
    };
  }

  /**
   * Splits excluded entries into exact words and patterns. Throws plain errors
   * for the caller to annotate, adding no stack frame.
   */
  private async resolveWords(
    words: ExcludedWords | undefined,
  ): Promise<ExcludedEntries> {
    const resolved: unknown =
      typeof words === "function" ? await words() : (words ?? []);
    const parsed = WORD_LIST_SCHEMA.safeParse(resolved);

    if (!parsed.success) {
      throw new Error(
        "must be a list of strings or RegExp objects, or a function returning one",
      );
    }

    const patterns: RegExp[] = [];
    const exact: string[] = [];

    // A loop rather than callbacks: each callback is one more frame deep in the
    // call stack the configuration is loaded through.
    for (const entry of parsed.data) {
      if (entry instanceof RegExp) {
        // A copy: the global and sticky flags would make `test` stateful.
        patterns.push(
          new RegExp(entry.source, entry.flags.replaceAll(/[gy]/gu, "")),
        );
      } else {
        exact.push(entry);
      }
    }

    return { patterns, words: exact };
  }

  // 🌎 Public Methods

  /**
   * Loads the run's configuration, or defaults. The scan root is the configuration
   * file's folder, so runs behave the same wherever invoked.
   */
  async loadConfiguration(
    args: LoadConfigurationArguments,
  ): Promise<ResolvedCoinagerieConfiguration> {
    const configurationPath = this.locate(args);

    if (configurationPath === undefined) {
      return this.resolve({
        configurationPath: undefined,
        directory: args.workingDirectory,
        loaded: { configuration: {}, excluded: { patterns: [], words: [] } },
        location: args.workingDirectory,
        overrides: args.overrides,
        workingDirectory: args.workingDirectory,
      });
    }

    return this.resolve({
      configurationPath,
      directory: path.dirname(configurationPath),
      loaded: await this.read(configurationPath),
      location: configurationPath,
      overrides: args.overrides,
      workingDirectory: args.workingDirectory,
    });
  }
}
