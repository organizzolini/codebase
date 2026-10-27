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
} from "./configuration.constants";

import type {
  CoinagerieConfiguration,
  LoadConfigurationArguments,
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
   * Imports a configuration file and validates its default export.
   *
   * Any failure — the file throwing, a syntax error, an export of the wrong
   * shape — is reported with the file's path, which is the one thing a reader
   * needs to find the fault.
   */
  private async read(
    configurationPath: string,
  ): Promise<CoinagerieConfiguration> {
    let exported: unknown;

    try {
      const jiti = createJiti(fileURLToPath(import.meta.url));
      exported = await jiti.import(configurationPath, { default: true });
    } catch (error: unknown) {
      throw new InvalidConfigurationError(
        configurationPath,
        error instanceof Error ? error.message : String(error),
      );
    }

    const parsed = CONFIGURATION_SCHEMA.safeParse(exported);

    if (!parsed.success) {
      throw new InvalidConfigurationError(
        configurationPath,
        z.prettifyError(parsed.error),
      );
    }

    return parsed.data;
  }

  /** Fills in every default and makes every path absolute. */
  private resolve(args: {
    configuration: CoinagerieConfiguration;
    configurationPath: string | undefined;
    directory: string;
  }): ResolvedCoinagerieConfiguration {
    const { configuration, directory } = args;

    return {
      configurationPath: args.configurationPath,
      directory,
      exclude: { paths: configuration.exclude?.paths ?? [] },
      include: configuration.include ?? [...DEFAULT_INCLUDE],
      outputs: (configuration.outputs ?? []).map((output) => ({
        description: output.description,
        path: path.resolve(directory, output.path),
        type: output.type,
      })),
    };
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
        configuration: {},
        configurationPath: undefined,
        directory: args.workingDirectory,
      });
    }

    return this.resolve({
      configuration: await this.read(configurationPath),
      configurationPath,
      directory: path.dirname(configurationPath),
    });
  }
}
