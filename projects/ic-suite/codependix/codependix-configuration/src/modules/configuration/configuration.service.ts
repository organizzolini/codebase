import path from "node:path";

import { Injectable } from "@nestjs/common";

import { InputService } from "../input/input.service";
import { OverrideResolutionService } from "../override-resolution/override-resolution.service";

import { ConfigurationLoaderService } from "./configuration-loader.service";
import {
  codependixProjectConfigurationSchema,
  ConfigurationPathRequiredError,
  DEFAULT_EXPORT_TARGET,
  DEFAULT_INCLUDE_GLOBS,
  DEFAULT_MARKDOWN_PATH,
  SELECTION_SEPARATOR,
  SUPPORTED_CONFIGURATION_EXTENSIONS,
  UnknownConfigurationFileTypeError,
} from "./configuration.constants";
import { FlagResolutionService } from "./flag-resolution.service";

import type {
  CodependixBoundariesConfiguration,
  ResolvedCodependixBoundariesConfiguration,
} from "./configuration-boundaries.types";
import type {
  CodependixConfiguration,
  CodependixGraphOutput,
  CodependixGraphType,
  CodependixProjectConfiguration,
  CodependixSelectionArguments,
  LoadConfigurationArguments,
  LoadProjectConfigurationArguments,
  MapCommandOptions,
  ProjectSelectionArguments,
  ResolvedCodependixConfiguration,
  ResolvedCodependixGraphOutput,
  ResolvedCodependixSelection,
  ResolveForProjectArguments,
} from "./configuration.types";
import type { RunMode, RunModeSelection } from "@codependix/core";

/**
 * Loads, validates, and resolves codependix configuration. Per-project resolution is kept apart
 * from loading, so it runs only for projects actually built.
 */
@Injectable()
export class ConfigurationService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationLoaderService: ConfigurationLoaderService,
    private readonly flagResolutionService: FlagResolutionService,
    private readonly inputService: InputService,
    private readonly overrideResolutionService: OverrideResolutionService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether `--projects` or `--tags` names a project. */
  private isProjectNamedOnCommandLine(
    args: ProjectSelectionArguments,
  ): boolean {
    const { selection } = args.configuration;

    return (
      this.matchesAnyName(
        args.projectName,
        args.projectRoot,
        selection.projects,
      ) || (args.projectTags ?? []).some((tag) => selection.tags.includes(tag))
    );
  }

  /** Whether a project's name matches at least one of a list of globs. */
  private matchesAnyGlob(projectName: string, globs: string[]): boolean {
    return globs.some((glob) => path.matchesGlob(projectName, glob));
  }

  /** Whether a project's name or its root matches at least one glob. */
  private matchesAnyName(
    projectName: string,
    projectRoot: string | undefined,
    globs: string[],
  ): boolean {
    return (
      this.matchesAnyGlob(projectName, globs) ||
      (projectRoot !== undefined && this.matchesAnyGlob(projectRoot, globs))
    );
  }

  /**
   * Fills in every graph level a `boundaries` block may omit, each as a list, so callers need not ask which were configured.
   */
  private resolveBoundaries(
    boundaries: CodependixBoundariesConfiguration | undefined,
  ): ResolvedCodependixBoundariesConfiguration {
    return {
      fileImports: {
        python: boundaries?.fileImports?.python ?? [],
        typescript: boundaries?.fileImports?.typescript ?? [],
      },
      nestjsModules: boundaries?.nestjsModules ?? [],
      nxProjects: boundaries?.nxProjects ?? [],
    };
  }

  /** Applies defaults to one graph type's export configuration. */
  private resolveGraphOutput(
    output: CodependixGraphOutput | undefined,
  ): ResolvedCodependixGraphOutput {
    const target = output?.target ?? DEFAULT_EXPORT_TARGET;
    const markdown = output?.markdown;

    return {
      json: output?.json === undefined ? undefined : { path: output.json.path },
      markdown:
        markdown === undefined
          ? undefined
          : {
              anchor: markdown.anchor,
              path: markdown.path ?? DEFAULT_MARKDOWN_PATH,
            },
      target,
    };
  }

  // 🌎 Public Methods

  /**
   * Splits `--projects` and `--tags` into lists, and reads `--no-dependencies` as building over the selection alone. Blank entries are dropped.
   */
  private resolveSelection(
    selection: CodependixSelectionArguments | undefined,
  ): ResolvedCodependixSelection {
    return {
      dependencies: selection?.dependencies !== false,
      projects: this.splitSelectionArgument(selection?.projects),
      tags: this.splitSelectionArgument(selection?.tags),
    };
  }

  /** Splits one comma-separated argument, trimming and dropping blanks. */
  private splitSelectionArgument(argument: string | undefined): string[] {
    return (argument ?? "")
      .split(SELECTION_SEPARATOR)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  /**
   * Whether a project takes part in graph export: matched by `include` or the command line, and not claimed by `exclude`.
   * `exclude` wins over flags.
   */
  public isProjectIncluded(args: ProjectSelectionArguments): boolean {
    const { configuration, projectName, projectRoot } = args;
    const isIncluded =
      this.matchesAnyName(projectName, projectRoot, configuration.include) ||
      this.isProjectNamedOnCommandLine(args);
    const isExcluded = this.matchesAnyName(
      projectName,
      projectRoot,
      configuration.exclude,
    );

    return isIncluded && !isExcluded;
  }

  /**
   * Whether a project is in the command line's selection. Naming none selects every project.
   * `include` never reaches the graph or gate, only selections do.
   */
  public isProjectSelected(args: ProjectSelectionArguments): boolean {
    const { selection } = args.configuration;

    if (selection.projects.length === 0 && selection.tags.length === 0) {
      return true;
    }

    return this.isProjectNamedOnCommandLine(args);
  }

  /**
   * Loads and validates a configuration file. The path must exist; nothing is searched for, so a typo fails rather than resolving to nothing.
   */
  public async loadConfiguration(
    args: LoadConfigurationArguments,
  ): Promise<ResolvedCodependixConfiguration> {
    const authored =
      await this.configurationLoaderService.readAuthoredConfiguration(args);

    return this.overrideResolutionService.applyOverrides({
      authored,
      overrides: args.overrides,
      resolved: this.resolveConfiguration(authored, args.selection),
    });
  }

  /**
   * Loads one project's own `codependix.config.ts`, or `undefined`. Searched for only at its root, never inherited from a parent.
   */
  public async loadProjectConfiguration(
    args: LoadProjectConfigurationArguments,
  ): Promise<CodependixProjectConfiguration | undefined> {
    const projectRoot = path.resolve(args.projectRoot);
    const resolvedPath =
      this.configurationLoaderService.findProjectConfigurationFile(projectRoot);

    if (resolvedPath === undefined) {
      return undefined;
    }

    const extension = path.extname(resolvedPath).toLowerCase();

    if (!SUPPORTED_CONFIGURATION_EXTENSIONS.has(extension)) {
      throw new UnknownConfigurationFileTypeError(resolvedPath);
    }

    const configurationModule =
      await this.configurationLoaderService.loadConfigurationModule({
        configurationPath: resolvedPath,
        extension,
      });

    return codependixProjectConfigurationSchema.parse(configurationModule);
  }

  /**
   * Parses a comma-separated list, dropping blanks. Forwarded here, since `ConfigurationService` is the one public service.
   */
  public parseCommaDelimitedOption(value: string | undefined): string[] {
    return this.inputService.parseCommaDelimitedOption(value);
  }

  /** Parses a valueless boolean flag, which is present or it is not. */
  public parseFlagOption(value: boolean | undefined): boolean {
    return this.inputService.parseFlagOption(value);
  }

  /** Trims an optional string option, treating blank as absent. */
  public parseOptionalOption(value: string | undefined): string | undefined {
    return this.inputService.parseOptionalOption(value);
  }

  /** Parses a path option that falls back to the working directory. */
  public parsePathOption(value: string | undefined): string {
    return this.inputService.parsePathOption(value);
  }

  /**
   * Returns the main configuration path, refusing a missing or blank one. `surface` names its source in the refusal.
   */
  public requireConfigurationPath(
    configurationPath: string | undefined,
    surface: string,
  ): string {
    if (configurationPath === undefined || configurationPath.trim() === "") {
      throw new ConfigurationPathRequiredError(surface);
    }

    return configurationPath;
  }

  /**
   * Fills in every field a configuration file may omit. Exposed so a host can pass an assembled configuration and get the file's shape.
   */
  public resolveConfiguration(
    configuration: CodependixConfiguration,
    selection?: CodependixSelectionArguments,
  ): ResolvedCodependixConfiguration {
    return {
      boundaries: this.resolveBoundaries(configuration.boundaries),
      exclude: configuration.exclude ?? [],
      include: configuration.include ?? [...DEFAULT_INCLUDE_GLOBS],
      nestjsRootModules: configuration.nestjsModules?.rootModules ?? {},
      projectGraph: configuration.projectGraph,
      selection: this.resolveSelection(selection),
      workspace: configuration.workspace ?? {},
    };
  }

  /**
   * Resolves one project's export configuration for one graph type. An excluded project, or one without
   * its own file, resolves to `target: "none"`.
   */
  public resolveForProject(
    args: ResolveForProjectArguments,
  ): ResolvedCodependixGraphOutput {
    const {
      configuration,
      graphType,
      projectConfiguration,
      projectName,
      projectRoot,
      projectTags,
    } = args;

    if (
      !this.isProjectIncluded({
        configuration,
        projectName,
        projectRoot,
        projectTags,
      })
    ) {
      return { json: undefined, markdown: undefined, target: "none" };
    }

    if (projectConfiguration === undefined) {
      return { json: undefined, markdown: undefined, target: "none" };
    }

    return this.resolveGraphOutput(projectConfiguration[graphType]);
  }

  /**
   * Resolves the Workspace Graph's export for one graph type. `include` and `exclude` never apply to it.
   */
  public resolveForWorkspace(
    configuration: ResolvedCodependixConfiguration,
    graphType: CodependixGraphType,
  ): ResolvedCodependixGraphOutput {
    return this.resolveGraphOutput(configuration.workspace[graphType]);
  }

  /**
   * Reads the flags into what the run writes and what it fails on.
   *
   * See `FlagResolutionService.selectMode` for which combinations are
   * refused and why.
   */
  public async selectMode(
    options: MapCommandOptions,
  ): Promise<RunModeSelection> {
    return this.flagResolutionService.selectMode(options);
  }

  /** Whether a run reads or rewrites the files its exports live in. */
  public touchesFiles(mode: RunMode): boolean {
    return this.flagResolutionService.touchesFiles(mode);
  }
}
