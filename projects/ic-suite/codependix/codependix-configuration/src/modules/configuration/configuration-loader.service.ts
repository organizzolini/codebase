import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Injectable } from "@nestjs/common";
import { createJiti } from "jiti";

import {
  codependixConfigurationSchema,
  ConfigurationFileNotFoundError,
  SUPPORTED_CONFIGURATION_EXTENSIONS,
  UnknownConfigurationFileTypeError,
} from "./configuration.constants";

import type { CodependixConfiguration } from "./configuration.types";

/**
 * Reads and parses codependix configuration files from disk.
 *
 * Kept apart from `ConfigurationService`, which resolves what a loaded
 * configuration means for a project or a workspace: this service only ever
 * answers "what is on disk", never "what should happen because of it".
 */
@Injectable()
export class ConfigurationLoaderService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Reads what a configuration module exported, through either interop shape. */
  private readDefaultExport(importedModule: unknown): unknown {
    if (typeof importedModule !== "object" || importedModule === null) {
      return {};
    }

    const defaultExport = (importedModule as { default?: unknown }).default;

    return typeof defaultExport === "object" && defaultExport !== null
      ? defaultExport
      : importedModule;
  }

  // 🌎 Public Methods

  /** Loads a configuration module, choosing the reader by extension. */
  public async loadConfigurationModule(args: {
    configurationPath: string;
    extension: string;
  }): Promise<unknown> {
    if (args.extension === ".json") {
      return JSON.parse(await readFile(args.configurationPath, "utf8"));
    }

    const jiti = createJiti(fileURLToPath(import.meta.url));

    return this.readDefaultExport(
      await jiti.import(args.configurationPath, { default: true }),
    );
  }

  /** Loads and validates one configuration file at a resolved path. */
  public async parseConfigurationFile(
    resolvedPath: string,
  ): Promise<CodependixConfiguration> {
    const extension = path.extname(resolvedPath).toLowerCase();

    if (!SUPPORTED_CONFIGURATION_EXTENSIONS.has(extension)) {
      throw new UnknownConfigurationFileTypeError(resolvedPath);
    }

    const configurationModule = await this.loadConfigurationModule({
      configurationPath: resolvedPath,
      extension,
    });

    return codependixConfigurationSchema.parse(configurationModule);
  }

  /**
   * Reads the main configuration file at the given path. The path is required: a missing file is an error, never an empty configuration.
   */
  public async readAuthoredConfiguration(args: {
    configurationPath: string;
  }): Promise<CodependixConfiguration> {
    return this.parseConfigurationFile(
      this.resolveConfigurationPath(args.configurationPath),
    );
  }

  /** Resolves a configuration path against the cwd alone, and refuses a path naming no file. */
  public resolveConfigurationPath(configurationPath: string): string {
    const absolutePath = path.resolve(configurationPath);

    if (!existsSync(absolutePath)) {
      throw new ConfigurationFileNotFoundError(absolutePath);
    }

    return absolutePath;
  }

  /**
   * Resolves a project's configuration file from its root and the configured relative path.
   * Nothing else is tried: a project may have none, so no file there is `undefined`.
   */
  public resolveProjectConfigurationFile(args: {
    projectConfigurationPath: string;
    projectRoot: string;
  }): string | undefined {
    const resolvedPath = path.resolve(
      args.projectRoot,
      args.projectConfigurationPath,
    );

    return existsSync(resolvedPath) ? resolvedPath : undefined;
  }
}
