import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Injectable } from "@nestjs/common";
import { createJiti } from "jiti";
import { parse as parseJsonc } from "jsonc-parser";

import {
  callidescopeConfigurationSchema,
  CONFIGURATION_FILE_NAMES,
  ConfigurationFileNotFoundError,
  DEFAULT_ENTRY_POINT_DECORATORS,
  DEFAULT_EXCLUDE_GLOBS,
  DEFAULT_JSON_INDENTATION,
  DEFAULT_MARKDOWN_END_MARKER,
  DEFAULT_MARKDOWN_START_MARKER,
  DEFAULT_MAXIMUM_DEPTH,
  DEFAULT_PREVIEW_COUNT,
  DEFAULT_RUN_HEADING,
  REPOSITORY_ROOT_MARKERS,
  SUPPORTED_CONFIGURATION_EXTENSIONS,
  UnknownConfigurationFileTypeError,
} from "./configuration.constants";

import type {
  CallidescopeConfiguration,
  CallidescopeEntryPoints,
  CallidescopeLimits,
  CallidescopeMarkdownOutputConfiguration,
  CallidescopeWriteConfiguration,
  LoadConfigurationArguments,
  LoadedCallidescopeConfiguration,
  ResolvedCallidescopeConfiguration,
  ResolvedCallidescopeEntryPoints,
  ResolvedCallidescopeJsonOutputConfiguration,
  ResolvedCallidescopeLimits,
  ResolvedCallidescopeMarkdownOutputConfiguration,
} from "./configuration.types";

/**
 * Loads, validates, and normalizes callidescope configuration files.
 *
 * This service owns loading only. What the configuration means — which files an
 * exclusion glob removes, which decorator marks a stack root — belongs to the
 * analyzers that read it, so that reading a configuration file stays free of any
 * knowledge of the repository being traced.
 */
@Injectable()
export class ConfigurationFileService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Finds the repository root by walking up from the cwd, for task runners that start in a project.
   */
  private findRepositoryRoot(): string | undefined {
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
  private async loadConfigurationModule(args: {
    configurationPath: string;
    extension: string;
  }): Promise<unknown> {
    if (args.extension === ".json" || args.extension === ".jsonc") {
      return this.loadJsonConfiguration(args);
    }

    const jiti = createJiti(fileURLToPath(import.meta.url));
    const importedModule: unknown = await jiti.import(args.configurationPath, {
      default: true,
    });

    if (typeof importedModule !== "object" || importedModule === null) {
      return {};
    }

    const defaultExport = (importedModule as { default?: unknown }).default;

    return typeof defaultExport === "object" && defaultExport !== null
      ? defaultExport
      : importedModule;
  }

  /** Reads a JSON or JSONC configuration file. */
  private async loadJsonConfiguration(args: {
    configurationPath: string;
    extension: string;
  }): Promise<unknown> {
    const configurationContent = await readFile(args.configurationPath, "utf8");

    return args.extension === ".jsonc"
      ? parseJsonc(configurationContent)
      : JSON.parse(configurationContent);
  }

  /** Resolves a configuration path against the cwd, then the repository root. */
  private resolveConfigurationPath(configurationPath: string): string {
    const absolutePath = path.resolve(configurationPath);

    if (existsSync(absolutePath)) {
      return absolutePath;
    }

    const repositoryRoot = this.findRepositoryRoot();

    if (repositoryRoot === undefined) {
      throw new ConfigurationFileNotFoundError(absolutePath);
    }

    const repositoryRelativePath = path.resolve(
      repositoryRoot,
      configurationPath,
    );

    if (!existsSync(repositoryRelativePath)) {
      throw new ConfigurationFileNotFoundError(absolutePath);
    }

    return repositoryRelativePath;
  }

  /**
   * Applies defaults to the entry-point rules. Defaulting the authored object once keeps one branch per option.
   */
  private resolveEntryPoints(
    entryPoints: CallidescopeEntryPoints | undefined,
  ): ResolvedCallidescopeEntryPoints {
    const authored = entryPoints ?? {};

    return {
      addresses: authored.addresses ?? [],
      decorators: authored.decorators ?? [...DEFAULT_ENTRY_POINT_DECORATORS],
      includeExportedFunctions: authored.includeExportedFunctions ?? true,
      includeOrphans: authored.includeOrphans ?? true,
      includeTests: authored.includeTests ?? false,
    };
  }

  /**
   * Adds the default noise directories to a configuration's own excludes, so it need not restate them.
   */
  private resolveExclude(exclude: string[] | undefined): string[] {
    return [...new Set([...DEFAULT_EXCLUDE_GLOBS, ...(exclude ?? [])])];
  }

  /** Applies defaults to the JSON output destination, if one was named. */
  private resolveJsonOutput(
    write: CallidescopeWriteConfiguration | undefined,
  ): ResolvedCallidescopeJsonOutputConfiguration | undefined {
    if (write?.json === undefined) {
      return undefined;
    }

    return {
      indentation: write.json.indentation ?? DEFAULT_JSON_INDENTATION,
      path: write.json.path,
    };
  }

  /** Applies defaults to every threshold. */
  private resolveLimits(
    limits: CallidescopeLimits | undefined,
  ): ResolvedCallidescopeLimits {
    const authored = limits ?? {};

    return {
      maximumBreadth: authored.maximumBreadth,
      maximumDepth: authored.maximumDepth ?? DEFAULT_MAXIMUM_DEPTH,
    };
  }

  /**
   * Applies defaults to one anchored markdown destination, if it was named. Shared by `markdown` and `mermaid`.
   */
  private resolveMarkdownDestination(
    destination: CallidescopeMarkdownOutputConfiguration | undefined,
  ): ResolvedCallidescopeMarkdownOutputConfiguration | undefined {
    if (destination === undefined) {
      return undefined;
    }

    return {
      description: destination.description,
      endMarker: destination.endMarker ?? DEFAULT_MARKDOWN_END_MARKER,
      heading: destination.heading ?? DEFAULT_RUN_HEADING,
      path: destination.path,
      previewCount: destination.previewCount ?? DEFAULT_PREVIEW_COUNT,
      // Left unset rather than defaulted: the built-in rendering and writing
      // live in the CLI that calls them, so "unset" is what selects them.
      render: destination.render,
      startMarker: destination.startMarker ?? DEFAULT_MARKDOWN_START_MARKER,
      writeBlock: destination.writeBlock,
    };
  }

  // 🌎 Public Methods

  /**
   * Finds a configuration file directly in one directory, without walking upward.
   * Walking up would hand every project the workspace file.
   */
  public findConfigurationFileAt(directory: string): string | undefined {
    for (const fileName of CONFIGURATION_FILE_NAMES) {
      const candidatePath = path.join(directory, fileName);

      if (existsSync(candidatePath)) {
        return candidatePath;
      }
    }

    return undefined;
  }

  /**
   * Loads and validates a configuration file. The path is required and must exist, so a typo fails rather than tracing with defaults.
   */
  public async loadConfiguration(
    args: LoadConfigurationArguments,
  ): Promise<ResolvedCallidescopeConfiguration> {
    const { configuration } = await this.loadConfigurationFile(args);

    return configuration;
  }

  /**
   * Loads a configuration, returning the authored object and the file it came from.
   * Its path lets a caller skip the run's own file.
   */
  public async loadConfigurationFile(
    args: LoadConfigurationArguments,
  ): Promise<LoadedCallidescopeConfiguration> {
    const resolvedPath = this.resolveConfigurationPath(args.configurationPath);

    const extension = path.extname(resolvedPath).toLowerCase();

    if (!SUPPORTED_CONFIGURATION_EXTENSIONS.has(extension)) {
      throw new UnknownConfigurationFileTypeError(resolvedPath);
    }

    const authored = callidescopeConfigurationSchema.parse(
      await this.loadConfigurationModule({
        configurationPath: resolvedPath,
        extension,
      }),
    );

    return {
      authored,
      configuration: this.resolveConfiguration(authored),
      path: resolvedPath,
    };
  }

  /**
   * Fills in every field a configuration may leave out. Also used by hosts that assemble a configuration object themselves.
   */
  public resolveConfiguration(
    configuration: CallidescopeConfiguration,
  ): ResolvedCallidescopeConfiguration {
    return {
      directories: configuration.directories ?? [],
      entryPoints: this.resolveEntryPoints(configuration.entryPoints),
      exclude: this.resolveExclude(configuration.exclude),
      excludeCallees: configuration.excludeCallees ?? [],
      excludeFrom: configuration.excludeFrom ?? [],
      limits: this.resolveLimits(configuration.limits),
      write: {
        json: this.resolveJsonOutput(configuration.write),
        markdown: this.resolveMarkdownDestination(
          configuration.write?.markdown,
        ),
        mermaid: this.resolveMarkdownDestination(configuration.write?.mermaid),
      },
    };
  }
}
