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
  WORD_LIST_SCHEMA,
} from "./configuration.constants";

import type {
  ExcludedWords,
  FoldWord,
  LoadConfigurationArguments,
  LoadedConfiguration,
  ResolvedCoinagerieConfiguration,
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
   * Wraps the configured fold so that its faults name the file.
   *
   * The function is the configuration's own code, and it runs once per word
   * long after the file was read; wrapping it here keeps every check of what
   * it did in the one place that knows the file's path.
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
          `fold must return a non-empty string, but returned ${folded === "" ? "an empty string" : String(folded)} for "${word}"`,
        );
      }

      return parsed.data;
    };
  }

  /**
   * The configuration file a run reads, or `undefined` when it uses defaults.
   *
   * A named file must exist. An unnamed one is searched for only in the
   * working directory, never above it, so a run never picks up a
   * configuration written for some enclosing folder.
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
   * Imports a configuration file, validates its default export, and calls
   * its `exclude.words` function when it has one.
   *
   * Any failure — the file throwing, a syntax error, an export of the wrong
   * shape, a function that throws or returns something else — is reported
   * with the file's path, which is the one thing a reader needs to find the
   * fault.
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
        words: await this.resolveWords(parsed.data.exclude?.words),
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
  }): ResolvedCoinagerieConfiguration {
    const { configuration, words } = args.loaded;
    const { directory, location } = args;

    return {
      configurationPath: args.configurationPath,
      directory,
      exclude: { paths: configuration.exclude?.paths ?? [], words },
      fold:
        configuration.fold === undefined
          ? undefined
          : this.guardFold(configuration.fold, location),
      include: configuration.include ?? [...DEFAULT_INCLUDE],
      outputs: (configuration.outputs ?? []).map((output) => ({
        description: output.description,
        path: path.resolve(directory, output.path),
        type: output.type,
      })),
    };
  }

  /**
   * The words a configuration excludes, calling its function when it has one.
   *
   * Throws a plain error for the caller to name the file in, so that no frame
   * is spent on building the report here.
   */
  private async resolveWords(
    words: ExcludedWords | undefined,
  ): Promise<string[]> {
    const resolved: unknown =
      typeof words === "function" ? await words() : (words ?? []);
    const parsed = WORD_LIST_SCHEMA.safeParse(resolved);

    if (!parsed.success) {
      throw new Error("must be a list of strings, or a function returning one");
    }

    return parsed.data;
  }

  // 🌎 Public Methods

  /**
   * Loads the run's configuration, or the defaults when there is none.
   *
   * The scan root is the configuration file's folder, so a run behaves the
   * same wherever it is invoked from.
   */
  async loadConfiguration(
    args: LoadConfigurationArguments,
  ): Promise<ResolvedCoinagerieConfiguration> {
    const configurationPath = this.locate(args);

    if (configurationPath === undefined) {
      return this.resolve({
        configurationPath: undefined,
        directory: args.workingDirectory,
        loaded: { configuration: {}, words: [] },
        location: args.workingDirectory,
      });
    }

    return this.resolve({
      configurationPath,
      directory: path.dirname(configurationPath),
      loaded: await this.read(configurationPath),
      location: configurationPath,
    });
  }
}
