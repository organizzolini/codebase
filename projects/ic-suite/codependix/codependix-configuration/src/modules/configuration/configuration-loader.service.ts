import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Injectable } from "@nestjs/common";
import { createJiti } from "jiti";

import {
  codependixConfigurationSchema,
  CONFIGURATION_FILE_NAMES,
  ConfigurationFileNotFoundError,
  REPOSITORY_ROOT_MARKERS,
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

  /**
   * Looks for a project's own configuration file, exactly at its root.
   *
   * This never walks upward: a project's own file must be colocated with it,
   * and walking upward would find the workspace root's configuration — or
   * another project's, in a nested layout — instead of correctly reporting
   * that this project has none.
   */
  public findProjectConfigurationFile(projectRoot: string): string | undefined {
    for (const fileName of CONFIGURATION_FILE_NAMES) {
      const candidatePath = path.join(projectRoot, fileName);

      if (existsSync(candidatePath)) {
        return candidatePath;
      }
    }

    return undefined;
  }

  /**
   * Walks upward from the process cwd looking for the workspace root.
   *
   * Used to resolve a configuration path given relative to that root even when
   * the command was invoked from a nested directory, which is what a task
   * runner does whenever it sets the cwd to a project rather than the
   * workspace.
   */
  public findWorkspaceRoot(): string | undefined {
    let candidateDirectory = path.resolve(process.cwd());

    for (;;) {
      const directory = candidateDirectory;
      const isRoot = REPOSITORY_ROOT_MARKERS.some((marker) =>
        existsSync(path.join(directory, marker)),
      );

      if (isRoot) {
        return candidateDirectory;
      }

      const parentDirectory = path.dirname(candidateDirectory);

      if (parentDirectory === candidateDirectory) {
        return undefined;
      }

      candidateDirectory = parentDirectory;
    }
  }

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
   * Reads the main configuration file at the path it was told to.
   *
   * The path is required: nothing searches for a file, and no file is not a
   * configuration that resolves every graph to `target: "none"`.
   */
  public async readAuthoredConfiguration(args: {
    configurationPath: string;
  }): Promise<CodependixConfiguration> {
    return this.parseConfigurationFile(
      this.resolveConfigurationPath(args.configurationPath),
    );
  }

  /** Resolves a configuration path against the cwd, then the workspace root. */
  public resolveConfigurationPath(configurationPath: string): string {
    const absolutePath = path.resolve(configurationPath);

    if (existsSync(absolutePath)) {
      return absolutePath;
    }

    const workspaceRoot = this.findWorkspaceRoot();

    if (workspaceRoot === undefined) {
      throw new ConfigurationFileNotFoundError(absolutePath);
    }

    const rootRelativePath = path.resolve(workspaceRoot, configurationPath);

    if (!existsSync(rootRelativePath)) {
      throw new ConfigurationFileNotFoundError(absolutePath);
    }

    return rootRelativePath;
  }
}
