import { ConfigurationService } from "@callidescope/configuration";
import {
  CallablesService,
  ClassesService,
  EntriesService,
  ExternalService,
  FileFilterService,
  GraphAssemblyService,
  ProgramService,
  WorkspaceService,
} from "@callidescope/graph";
import { ProjectReportsService } from "@callidescope/output";
import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { INCLUDE_CONSTRUCTOR_EDGES } from "./callidescope.constants";

import type {
  AnalyzeOutcome,
  DiscoveredWorkspace,
  LocateOutcome,
  ProjectDeclarations,
  TraceArguments,
  TraceOutcome,
} from "./callidescope.types";
import type {
  CallidescopeLimitOverrides,
  CallidescopeLimits,
  ProjectLimitsLookup,
  ResolvedCallidescopeConfiguration,
  ResolvedCallidescopeEntryPoints,
} from "@callidescope/configuration";
import type { CallableId, CallGraphSummary } from "@callidescope/core";
import type {
  DepthMeasurement,
  DiscoveredCallable,
  FileFilter,
  ProgramSet,
  WorkspaceProject,
} from "@callidescope/graph";

/**
 * Runs one trace of a workspace, from tsconfig files to findings.
 */
@Injectable()
export class CallidescopeService {
  // 🏗 Dependency Injection

  constructor(
    private readonly callablesService: CallablesService,
    private readonly classHierarchyService: ClassesService,
    private readonly entryPointsService: EntriesService,
    private readonly externalService: ExternalService,
    private readonly fileFilterService: FileFilterService,
    private readonly graphAssemblyService: GraphAssemblyService,
    private readonly programService: ProgramService,
    private readonly configurationService: ConfigurationService,
    private readonly projectReportsService: ProjectReportsService,
    private readonly workspaceService: WorkspaceService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CallidescopeService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Collects every callable, before analysis. Both `trace` and `locate` read the same
   * declarations, so an address resolves against the files a gated run measures.
   */
  private async discoverCallables(
    args: TraceArguments,
  ): Promise<DiscoveredWorkspace> {
    const { fileFilter, programSet, projects, startingProjects } =
      this.discoverPrograms(args);
    const projectNames = projects.map((project) => project.name);
    // Between discovery and collection, which is the only moment either
    // answer can be had: a project's own file sits at a root discovery is
    // what finds, and its `exclude` decides what collection may look at.
    const declarations = await this.loadProjectDeclarations({
      authoredLimits: args.authoredLimits,
      configuration: args.configuration,
      configurationPath: args.configurationPath,
      limitOverrides: args.limitOverrides,
      projectNames,
      workspaceRoot: args.workspaceRoot,
    });

    this.externalService.configure({
      ownedFilePaths: new Set(programSet.ownerByFilePath.keys()),
      workspaceRoot: args.workspaceRoot,
    });
    this.classHierarchyService.build({ programs: programSet.programs });

    const collection = this.callablesService.collect({
      fileFilter: this.fileFilterService.buildProjectFileFilter({
        excludeByProject: declarations.excludeByProject,
        fileFilter,
        projects,
      }),
      includeTests: args.configuration.entryPoints.includeTests,
      // The fifth `entryPoints` field, read here rather than beside the other
      // four: the rest decide which of the collected callables root a stack,
      // and this one decides whether a file is collected at all — so it is
      // spent at collection, the same layer a project's `exclude` is.
      includeTestsByProject: new Map(
        [...declarations.entryPointsByProject].map(([project, entryPoints]) => [
          project,
          entryPoints.includeTests,
        ]),
      ),
      ownerByFilePath: programSet.ownerByFilePath,
      workspaceRoot: args.workspaceRoot,
    });

    return {
      ...declarations,
      collection,
      projectNames,
      // The starting projects rather than the closure: measurement reaches
      // into a project's dependencies, publishing does not. A run scoped to
      // one package would otherwise rewrite a section in every README its
      // imports happened to reach, which is a whole-workspace run's job.
      startingProjectRoots: new Map(
        startingProjects.map((project) => [project.name, project.root]),
      ),
    };
  }

  /**
   * Builds a program for each project a run covers. Excluded projects are dropped
   * before their tsconfig opens.
   */
  private discoverPrograms(args: TraceArguments): {
    fileFilter: FileFilter;
    programSet: ProgramSet;
    projects: WorkspaceProject[];
    startingProjects: WorkspaceProject[];
  } {
    const fileFilter = this.fileFilterService.buildFileFilter({
      exclude: args.configuration.exclude,
      excludeFrom: args.configuration.excludeFrom,
      workspaceRoot: args.workspaceRoot,
    });
    const startingProjects = this.workspaceService.discoverProjects({
      directories: args.directories,
      fileFilter,
      workspaceRoot: args.workspaceRoot,
    });
    // A run naming no directory already asked for every project, so the walk
    // that would find them again is the one it just did.
    const workspaceProjects =
      args.directories.length === 0
        ? startingProjects
        : this.workspaceService.discoverProjects({
            directories: [],
            fileFilter,
            workspaceRoot: args.workspaceRoot,
          });
    const programSet = this.programService.buildPrograms({
      startingProjects,
      workspaceProjects,
      workspaceRoot: args.workspaceRoot,
    });

    return {
      fileFilter,
      programSet,
      // The closure rather than the starting roots: a scoped run traces the
      // projects its imports reach as well, so a call into a dependency lands
      // on a frame instead of stopping at the package boundary.
      projects: programSet.programs.map(
        (projectProgram) => projectProgram.project,
      ),
      startingProjects,
    };
  }

  /**
   * Reads each traced project's entry-point rules, exclusions, limits, and destinations
   * in one load, so a run never mixes two reads.
   */
  private async loadProjectDeclarations(args: {
    authoredLimits: CallidescopeLimits | undefined;
    configuration: ResolvedCallidescopeConfiguration;
    configurationPath: string;
    limitOverrides: CallidescopeLimitOverrides | undefined;
    projectNames: readonly string[];
    workspaceRoot: string;
  }): Promise<ProjectDeclarations> {
    const loaded = await this.configurationService.loadProjectConfigurations({
      projects: args.projectNames,
      workspaceConfigurationPath: args.configurationPath,
      workspaceRoot: args.workspaceRoot,
    });

    return {
      entryPointsByProject: new Map(
        loaded.map((projectConfiguration) => [
          projectConfiguration.project,
          projectConfiguration.configuration.entryPoints,
        ]),
      ),
      excludeByProject: new Map(
        loaded
          .filter(
            (projectConfiguration) =>
              (projectConfiguration.authored.exclude ?? []).length > 0,
          )
          .map((projectConfiguration) => [
            projectConfiguration.project,
            projectConfiguration.authored.exclude ?? [],
          ]),
      ),
      projectLimits: this.configurationService.resolveLimits({
        limitOverrides: args.limitOverrides,
        projectConfigurations: loaded,
        projects: args.projectNames,
        workspaceAuthoredLimits: args.authoredLimits,
        workspaceConfiguration: args.configuration,
        workspaceConfigurationPath: args.configurationPath,
      }),
      // Every loaded project, unfiltered: a complete configuration always
      // names both destinations, so a project publishing nothing wrote
      // `markdown: undefined` rather than being absent here. There is no
      // fan-out left for an absence to fall through to.
      writeByProject: new Map(
        loaded.map((projectConfiguration) => [
          projectConfiguration.project,
          projectConfiguration.configuration.write,
        ]),
      ),
    };
  }

  /**
   * The deepest depth any component reached, closure included. Not what a scoped run is judged on.
   */
  private readMaximumDepth(measurement: DepthMeasurement): number {
    return measurement.byComponent.reduce(
      (deepest, entry) => Math.max(deepest, entry.depth),
      0,
    );
  }

  // 🌎 Public Methods

  /** Derives every finding from the collected callables. */
  public analyze(args: {
    callablesById: ReadonlyMap<CallableId, DiscoveredCallable>;
    configuration: ResolvedCallidescopeConfiguration;
    /** Entry-point rules a project declared for itself, keyed by project name. */
    entryPointsByProject: ReadonlyMap<string, ResolvedCallidescopeEntryPoints>;
    fileCount: number;
    fileCountByProject: ReadonlyMap<string, number>;
    projectCount: number;
    /** The depth and breadth limits each traced project is judged against. */
    projectLimits: ProjectLimitsLookup;
    projectNames: readonly string[];
    workspaceRoot: string;
  }): AnalyzeOutcome {
    const { breadthMeasurement, condensed, graph, measurement } =
      this.graphAssemblyService.assemble({
        callablesById: args.callablesById,
        excludeCallees: args.configuration.excludeCallees,
        includeConstructorEdges: INCLUDE_CONSTRUCTOR_EDGES,
        workspaceRoot: args.workspaceRoot,
      });
    const entryPoints = this.entryPointsService.resolve({
      callablesById: args.callablesById,
      entryPoints: args.configuration.entryPoints,
      entryPointsByProject: args.entryPointsByProject,
      graph,
      workspaceRoot: args.workspaceRoot,
    });
    const projects = this.projectReportsService.build({
      breadthMeasurement,
      callablesById: args.callablesById,
      condensed,
      entryPoints,
      fileCountByProject: args.fileCountByProject,
      graph,
      measurement,
      projectNames: args.projectNames,
    });

    const summary: CallGraphSummary = {
      callableCount: args.callablesById.size,
      cyclicComponentCount: condensed.memberIdsByComponent.filter(
        (members) => members.length > 1,
      ).length,
      edgeCount: graph.edges.length,
      entryPointCount: entryPoints.entryPoints.length,
      fileCount: args.fileCount,
      maximumDepth: this.readMaximumDepth(measurement),
      projectCount: args.projectCount,
      unresolvedCallCount: graph.unresolvedCalls.length,
    };

    // `maximumDepthTraced`, never `maximumDepth`. A scoped run traces its dependency
    // closure, so this number can belong to a project it was never pointed at. Under
    // the bare name it would read as that project's limit, which would be headroom.
    this.logger.info("🔭 Finished an analysis", undefined, {
      callableCount: summary.callableCount,
      edgeCount: summary.edgeCount,
      entryPointCount: summary.entryPointCount,
      maximumDepthTraced: summary.maximumDepth,
    });

    return {
      projectLimits: args.projectLimits,
      result: {
        deepStacks: this.projectReportsService.findDeepStacks({
          limits: args.projectLimits,
          reports: projects,
        }),
        projects,
        summary,
        wideCallables: this.projectReportsService.findWideCallables({
          limits: args.projectLimits,
          reports: projects,
        }),
      },
      unresolvedAddresses: entryPoints.unresolvedAddresses,
    };
  }

  /**
   * Collects and assembles the graph without the full analysis, for `depth` and `breadth`.
   */
  public async locate(args: TraceArguments): Promise<LocateOutcome> {
    const { collection, startingProjectRoots } =
      await this.discoverCallables(args);
    const { graph } = this.graphAssemblyService.assemble({
      callablesById: collection.byId,
      excludeCallees: args.configuration.excludeCallees,
      includeConstructorEdges: INCLUDE_CONSTRUCTOR_EDGES,
      workspaceRoot: args.workspaceRoot,
    });

    return { callablesById: collection.byId, graph, startingProjectRoots };
  }

  /** Traces a workspace and returns everything the run found. */
  public async trace(args: TraceArguments): Promise<TraceOutcome> {
    this.logger.info("🔭 Tracing a workspace", undefined, {
      workspaceRoot: args.workspaceRoot,
    });

    const {
      collection,
      entryPointsByProject,
      projectLimits,
      projectNames,
      startingProjectRoots,
      writeByProject,
    } = await this.discoverCallables(args);
    const analyzed = this.analyze({
      callablesById: collection.byId,
      configuration: args.configuration,
      entryPointsByProject,
      fileCount: collection.fileCount,
      fileCountByProject: collection.fileCountByProject,
      projectCount: projectNames.length,
      projectLimits,
      projectNames,
      workspaceRoot: args.workspaceRoot,
    });

    return {
      ...analyzed,
      projectNames,
      startingProjectRoots,
      writeByProject,
    };
  }
}
