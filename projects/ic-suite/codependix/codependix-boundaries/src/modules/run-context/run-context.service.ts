import path from "node:path";

import {
  CODEPENDIX_GRAPH_TYPES,
  ConfigurationService,
} from "@codependix/configuration";
import { NeighborhoodService } from "@codependix/nx-projects";
import { Injectable } from "@nestjs/common";

import { emptySelectionError } from "./run-context.constants";

import type { GraphRunContext, UnmatchedSelection } from "./run-context.types";
import type {
  CodependixGraphType,
  CodependixProjectConfiguration,
  MapCommandOptions,
  ResolvedCodependixConfiguration,
} from "@codependix/configuration";
import type { CodependixRunMode } from "@codependix/core";
import type { NxProject, NxProjectGraph } from "@codependix/nx-projects";

/**
 * Resolves everything one run reads, once, before any pass runs. Every pass shares this one
 * resolved context, so a run reads the project graph once.
 */
@Injectable()
export class RunContextService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly neighborhoodService: NeighborhoodService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Whether a configuration's selection claims one project. Shared with the unmatched-entry probe,
   * so the two cannot disagree.
   */
  private isSelectedBy(args: {
    configuration: ResolvedCodependixConfiguration;
    project: NxProject;
    workingDirectory: string;
  }): boolean {
    return this.configurationService.isProjectSelected({
      configuration: args.configuration,
      projectName: args.project.name,
      projectRoot: path.relative(
        args.workingDirectory,
        args.project.absoluteRoot,
      ),
      projectTags: args.project.tags,
    });
  }

  /**
   * Loads the configuration at the path the caller named, with the command
   * line's overrides and selection layered over it.
   */
  private async loadConfiguration(args: {
    configuration: string;
    options: MapCommandOptions;
  }): Promise<ResolvedCodependixConfiguration> {
    const { configuration, options } = args;

    return this.configurationService.loadConfiguration({
      configurationPath: configuration,
      overrides: { exclude: options.exclude, include: options.include },
      selection: {
        dependencies: options.dependencies,
        projects: options.projects,
        tags: options.tags,
      },
    });
  }

  /**
   * Loads each project's codependix.config.ts, keyed by name. A project with no file is normal, so it maps to `undefined` rather than failing.
   */
  private async loadProjectConfigurations(
    projects: NxProject[],
  ): Promise<Map<string, CodependixProjectConfiguration | undefined>> {
    const entries = await Promise.all(
      projects.map(
        async (project) =>
          [
            project.name,
            await this.configurationService.loadProjectConfiguration({
              projectRoot: project.absoluteRoot,
            }),
          ] as const,
      ),
    );

    return new Map(entries);
  }

  /**
   * The projects every boundary graph is built over: the dependency closure, or the selection under
   * `--no-dependencies`. Only the selection is judged.
   */
  private resolveBuildProjects(args: {
    configuration: ResolvedCodependixConfiguration;
    graph: NxProjectGraph;
    projects: NxProject[];
    selectedProjects: NxProject[];
  }): NxProject[] {
    if (!args.configuration.selection.dependencies) {
      return args.selectedProjects;
    }

    const closure = new Set(
      this.neighborhoodService.resolveDependencyClosure(
        args.graph,
        args.selectedProjects.map((project) => project.name),
      ),
    );

    return args.projects.filter((project) => closure.has(project.name));
  }

  /**
   * The graph types this run builds, checks, and writes. Each is enabled unless its `--no-*` flag
   * disabled it.
   */
  private resolveEnabledGraphTypes(
    options: MapCommandOptions,
  ): Set<CodependixGraphType> {
    return new Set(
      CODEPENDIX_GRAPH_TYPES.filter(
        (graphType) => options[graphType] !== false,
      ),
    );
  }

  /**
   * Resolves a supplied project graph's path against the workspace root, as every export path does.
   */
  private resolveProjectGraphPath(
    projectGraph: string | undefined,
    workingDirectory: string,
  ): string | undefined {
    return projectGraph === undefined
      ? undefined
      : path.resolve(workingDirectory, projectGraph);
  }

  /**
   * Resolves the selection a run judges and the build set. A selection matching no project is refused
   * here, before any pass runs.
   */
  private resolveProjectSets(args: {
    configuration: ResolvedCodependixConfiguration;
    graph: NxProjectGraph;
    projects: NxProject[];
    workingDirectory: string;
  }): Pick<GraphRunContext, "buildProjects" | "selectedProjects"> {
    const { selection } = args.configuration;
    const selectedProjects = this.selectProjects(args);

    if (
      selectedProjects.length === 0 &&
      selection.projects.length + selection.tags.length > 0
    ) {
      throw emptySelectionError(selection);
    }

    return {
      buildProjects: this.resolveBuildProjects({ ...args, selectedProjects }),
      selectedProjects,
    };
  }

  /**
   * Narrows every project to the `--projects` and `--tags` selection. A run naming neither selects
   * all, and `include`/`exclude` never reach this.
   */
  private selectProjects(args: {
    configuration: ResolvedCodependixConfiguration;
    projects: NxProject[];
    workingDirectory: string;
  }): NxProject[] {
    return args.projects.filter((project) =>
      this.isSelectedBy({
        configuration: args.configuration,
        project,
        workingDirectory: args.workingDirectory,
      }),
    );
  }

  // 🌎 Public Methods

  /**
   * Reads the configuration and project graph a run acts on. Called once per run, so every pass shares the one read.
   */
  async build(args: {
    /** The configuration file's path, already required by the caller. */
    configuration: string;
    mode: CodependixRunMode;
    options: MapCommandOptions;
    workingDirectory: string;
  }): Promise<GraphRunContext> {
    const { mode, options, workingDirectory } = args;
    const configuration = await this.loadConfiguration({
      configuration: args.configuration,
      options,
    });
    const graph = await this.neighborhoodService.readProjectGraph(
      this.resolveProjectGraphPath(
        configuration.projectGraph,
        workingDirectory,
      ),
    );
    const projects = this.neighborhoodService.readProjects(
      graph,
      workingDirectory,
    );
    const projectConfigurations =
      await this.loadProjectConfigurations(projects);

    return {
      ...this.resolveProjectSets({
        configuration,
        graph,
        projects,
        workingDirectory,
      }),
      configuration,
      enabledGraphTypes: this.resolveEnabledGraphTypes(options),
      graph,
      mode,
      projectConfigurations,
      projects,
      workingDirectory,
    };
  }

  /**
   * Patterns and tags that matched no project, each probed alone. A fully unmatched selection never gets here: `build` refuses it.
   */
  findUnmatchedSelection(
    context: Pick<
      GraphRunContext,
      "configuration" | "projects" | "workingDirectory"
    >,
  ): UnmatchedSelection {
    const { configuration, projects, workingDirectory } = context;
    const matches = (selection: {
      projects: string[];
      tags: string[];
    }): boolean =>
      projects.some((project) =>
        this.isSelectedBy({
          configuration: {
            ...configuration,
            selection: { ...configuration.selection, ...selection },
          },
          project,
          workingDirectory,
        }),
      );

    return {
      projects: configuration.selection.projects.filter(
        (entry) => !matches({ projects: [entry], tags: [] }),
      ),
      tags: configuration.selection.tags.filter(
        (tag) => !matches({ projects: [], tags: [tag] }),
      ),
    };
  }
}
