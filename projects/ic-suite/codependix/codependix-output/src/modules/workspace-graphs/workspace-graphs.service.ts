import { ConfigurationService } from "@codependix/configuration";
import {
  FileImportsWorkspaceGraphService,
  PythonService,
  TypescriptService,
} from "@codependix/file-imports";
import {
  ModuleGraphService,
  NestjsModulesWorkspaceGraphService,
  NestjsProjectService,
} from "@codependix/nestjs-modules";
import { WorkspaceGraphService } from "@codependix/nx-projects";
import { Injectable } from "@nestjs/common";

import { DeliveryService } from "../delivery/delivery.service";
import {
  FILE_IMPORTS_GRAPH_TYPE,
  FILE_IMPORTS_MARKDOWN_SUBHEADING,
  MARKDOWN_SECTION_INTRO_LINE,
  NESTJS_MODULES_GRAPH_TYPE,
  NESTJS_MODULES_MARKDOWN_SUBHEADING,
  NX_PROJECTS_GRAPH_TYPE,
  WORKSPACE_GRAPH_PROJECT_NAME,
} from "../graph-run/graph-run.constants";

import type {
  FileImportsWorkspaceGraphExport,
  NestjsModulesWorkspaceGraphExport,
  NxWorkspaceGraphExport,
} from "../graph-run/graph-run.types";
import type { WorkspaceGraphRunOutcome } from "./workspace-graphs.types";
import type { GraphRunContext } from "@codependix/boundaries";
import type { ResolvedCodependixGraphOutput } from "@codependix/configuration";
import type {
  CodependixRunMode,
  MarkdownSectionArguments,
  ProjectRunResult,
} from "@codependix/core";
import type { TypescriptImportGraph } from "@codependix/file-imports";
import type { NestjsModuleGraph } from "@codependix/nestjs-modules";
import type { WorkspaceGraph } from "@codependix/nx-projects";

/**
 * Builds and delivers every whole-workspace graph: the Nx Workspace Graph, the file-imports graph,
 * and the NestJS module graph. Each run returns its rendered data as well as its delivery outcome,
 * for combined output.
 */
@Injectable()
export class WorkspaceGraphsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly deliveryService: DeliveryService,
    private readonly fileImportsWorkspaceGraphService: FileImportsWorkspaceGraphService,
    private readonly moduleGraphService: ModuleGraphService,
    private readonly nestjsModulesWorkspaceGraphService: NestjsModulesWorkspaceGraphService,
    private readonly nestjsProjectService: NestjsProjectService,
    private readonly pythonService: PythonService,
    private readonly typescriptService: TypescriptService,
    private readonly workspaceGraphService: WorkspaceGraphService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Builds the section heading a graph type's anchored Markdown destination auto-creates when it is missing. */
  private buildMarkdownSection(subheading?: string): MarkdownSectionArguments {
    return { introLine: MARKDOWN_SECTION_INTRO_LINE, subheading };
  }

  /**
   * Explores and builds every discovered NestJS project's module graph. Kept apart to stay under the breadth limit.
   */
  private async buildNestjsModuleGraphs(
    selectedProjects: GraphRunContext["selectedProjects"],
    rootModules: GraphRunContext["configuration"]["nestjsRootModules"],
  ): Promise<NestjsModuleGraph[]> {
    const nestjsProjects = this.nestjsProjectService.discoverProjects(
      selectedProjects,
      rootModules,
    );
    const moduleGraphs: NestjsModuleGraph[] = [];

    for (const project of nestjsProjects) {
      const tree = await this.nestjsProjectService.exploreProject(project);

      moduleGraphs.push(this.moduleGraphService.buildGraph(tree, project.name));
    }

    return moduleGraphs;
  }

  /**
   * Builds every discovered TypeScript project's own file-level import graph.
   *
   * Kept apart from `runFileImportsWorkspaceGraph` for the same breadth
   * reason `buildNestjsModuleGraphs` is.
   */
  private buildTypescriptGraphs(
    selectedProjects: GraphRunContext["selectedProjects"],
  ): TypescriptImportGraph[] {
    return this.typescriptService
      .discoverProjects(selectedProjects)
      .map((project) =>
        this.typescriptService.buildGraph(
          this.typescriptService.buildProgram(project),
        ),
      );
  }

  /**
   * Delivers one already-built whole-workspace graph's configured destinations, at the workspace root.
   * The one place both builders hand off to `DeliveryService`.
   */
  private deliverWorkspaceGraph(args: {
    jsonExport: unknown;
    markdownContent: string;
    markdownSubheading: string | undefined;
    mode: CodependixRunMode;
    resolvedOutput: ResolvedCodependixGraphOutput;
    workingDirectory: string;
  }): ProjectRunResult {
    return this.deliveryService.deliverGraphOutput({
      jsonContent:
        args.resolvedOutput.json === undefined
          ? undefined
          : this.deliveryService.renderJson(args.jsonExport),
      markdownContent:
        args.resolvedOutput.markdown === undefined
          ? undefined
          : args.markdownContent,
      markdownSection: this.buildMarkdownSection(args.markdownSubheading),
      mode: args.mode,
      project: {
        absoluteRoot: args.workingDirectory,
        name: WORKSPACE_GRAPH_PROJECT_NAME,
      },
      resolvedOutput: args.resolvedOutput,
    });
  }

  // 🌎 Public Methods

  /**
   * Builds, renders, and delivers the whole-workspace file-level import graph. Not built at all
   * when the target is `"none"`.
   */
  runFileImportsWorkspaceGraph(
    context: GraphRunContext,
  ): WorkspaceGraphRunOutcome {
    const { configuration, mode, workingDirectory } = context;
    const resolvedOutput = this.configurationService.resolveForWorkspace(
      configuration,
      FILE_IMPORTS_GRAPH_TYPE,
    );

    if (resolvedOutput.target === "none") {
      return { entry: undefined, result: undefined };
    }

    const typescriptGraphs = this.buildTypescriptGraphs(
      context.selectedProjects,
    );
    const pythonGraphs = this.pythonService
      .discoverProjects(context.selectedProjects)
      .map((project) => this.pythonService.buildGraph(project));
    const workspaceGraph =
      this.fileImportsWorkspaceGraphService.buildWorkspaceGraph({
        pythonGraphs,
        typescriptGraphs,
      });
    const jsonExport: FileImportsWorkspaceGraphExport = workspaceGraph;
    const markdownContent =
      this.fileImportsWorkspaceGraphService.renderMermaid(workspaceGraph);

    return {
      entry: { json: jsonExport, markdown: markdownContent },
      result: this.deliverWorkspaceGraph({
        jsonExport,
        markdownContent,
        markdownSubheading: FILE_IMPORTS_MARKDOWN_SUBHEADING,
        mode,
        resolvedOutput,
        workingDirectory,
      }),
    };
  }

  /**
   * Builds and delivers the whole-workspace NestJS module graph, skipped when its target is `"none"`.
   */
  async runNestjsModulesWorkspaceGraph(
    context: GraphRunContext,
  ): Promise<WorkspaceGraphRunOutcome> {
    const { configuration, mode, workingDirectory } = context;
    const resolvedOutput = this.configurationService.resolveForWorkspace(
      configuration,
      NESTJS_MODULES_GRAPH_TYPE,
    );

    if (resolvedOutput.target === "none") {
      return { entry: undefined, result: undefined };
    }

    const moduleGraphs = await this.buildNestjsModuleGraphs(
      context.selectedProjects,
      context.configuration.nestjsRootModules,
    );
    const workspaceGraph =
      this.nestjsModulesWorkspaceGraphService.buildWorkspaceGraph(moduleGraphs);
    const jsonExport: NestjsModulesWorkspaceGraphExport = workspaceGraph;
    const markdownContent =
      this.nestjsModulesWorkspaceGraphService.renderMermaid(workspaceGraph);

    return {
      entry: { json: jsonExport, markdown: markdownContent },
      result: this.deliverWorkspaceGraph({
        jsonExport,
        markdownContent,
        markdownSubheading: NESTJS_MODULES_MARKDOWN_SUBHEADING,
        mode,
        resolvedOutput,
        workingDirectory,
      }),
    };
  }

  /**
   * Renders and delivers the Nx Workspace Graph's configured destinations, from the already-read
   * Nx project graph. Skipped when the resolved target is `"none"`.
   */
  runNxWorkspaceGraph(context: GraphRunContext): WorkspaceGraphRunOutcome {
    const { configuration, graph, mode, workingDirectory } = context;
    const resolvedOutput = this.configurationService.resolveForWorkspace(
      configuration,
      NX_PROJECTS_GRAPH_TYPE,
    );

    if (resolvedOutput.target === "none") {
      return { entry: undefined, result: undefined };
    }

    const workspaceGraph: WorkspaceGraph =
      this.workspaceGraphService.buildWorkspaceGraph(
        graph,
        context.selectedProjects,
      );
    const jsonExport: NxWorkspaceGraphExport = workspaceGraph;
    const markdownContent =
      this.workspaceGraphService.renderMermaid(workspaceGraph);

    return {
      entry: { json: jsonExport, markdown: markdownContent },
      result: this.deliverWorkspaceGraph({
        jsonExport,
        markdownContent,
        markdownSubheading: undefined,
        mode,
        resolvedOutput,
        workingDirectory,
      }),
    };
  }
}
