import { NeighborhoodService } from "@codependix/nx-projects";
import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProjectGraphsService } from "../project-graphs/project-graphs.service";
import { PythonImportsService } from "../python-imports/python-imports.service";
import { WorkspaceGraphsService } from "../workspace-graphs/workspace-graphs.service";

import {
  EMPTY_GRAPH_RUN_OUTCOME,
  EMPTY_GRAPH_TYPE_PASS_OUTCOME,
  FILE_IMPORTS_GRAPH_TYPE,
  NESTJS_MODULES_GRAPH_TYPE,
  NX_PROJECTS_GRAPH_TYPE,
  WORKSPACE_GRAPH_PROJECT_NAME,
} from "./graph-run.constants";

import type { WorkspaceGraphRunOutcome } from "../workspace-graphs/workspace-graphs.types";
import type {
  CombinedGraphExports,
  GraphTypePassOutcome,
  MapRunResult,
} from "./graph-run.types";
import type { GraphRunContext } from "@codependix/boundaries";
import type { GraphRunOutcome, ProjectRunFailure } from "@codependix/core";

/**
 * Orchestrates every configured graph export, one pass per graph type. Each pass isolates a
 * project's failure, which is collected rather than aborting the loop.
 *
 * Per-project and per-workspace rendering lives in `ProjectGraphsService` and `WorkspaceGraphsService`.
 */
@Injectable()
export class GraphRunService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly neighborhoodService: NeighborhoodService,
    private readonly projectGraphsService: ProjectGraphsService,
    private readonly pythonImportsService: PythonImportsService,
    private readonly workspaceGraphsService: WorkspaceGraphsService,
  ) {
    this.logger.setContext(GraphRunService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Collects every active graph type's whole-workspace data for `CombinedOutputService`, dropping
   * a type that built no whole-workspace graph.
   */
  private collectCombinedGraphs(args: {
    importsOutcome: GraphTypePassOutcome;
    nestjsOutcome: GraphTypePassOutcome;
    nxOutcome: GraphTypePassOutcome;
  }): CombinedGraphExports {
    const { importsOutcome, nestjsOutcome, nxOutcome } = args;
    const combinedGraphs: CombinedGraphExports = {};

    if (nxOutcome.workspaceEntry !== undefined) {
      combinedGraphs.nxProjects = nxOutcome.workspaceEntry;
    }

    if (importsOutcome.workspaceEntry !== undefined) {
      combinedGraphs.fileImports = importsOutcome.workspaceEntry;
    }

    if (nestjsOutcome.workspaceEntry !== undefined) {
      combinedGraphs.nestjsModules = nestjsOutcome.workspaceEntry;
    }

    return combinedGraphs;
  }

  /** Turns a raised error into a `ProjectRunFailure` for the given project. */
  private collectProjectFailure(
    projectName: string,
    error: unknown,
  ): ProjectRunFailure {
    return {
      error: error instanceof Error ? error.message : String(error),
      projectName,
    };
  }

  /**
   * Runs one synchronous whole-workspace builder, pushing its delivery outcome and returning its
   * combined-output entry. `runNestjsGraphs` is async and keeps its own `try`/`catch`.
   */
  private collectWorkspaceOutcome(args: {
    build: () => WorkspaceGraphRunOutcome;
    failures: ProjectRunFailure[];
    results: GraphRunOutcome["results"];
  }): GraphTypePassOutcome["workspaceEntry"] {
    try {
      const outcome = args.build();

      if (outcome.result !== undefined) {
        args.results.push(outcome.result);
      }

      return outcome.entry;
    } catch (error) {
      args.failures.push(
        this.collectProjectFailure(WORKSPACE_GRAPH_PROJECT_NAME, error),
      );
      return undefined;
    }
  }

  // 🌎 Public Methods

  /**
   * Runs every configured graph export. Every pass is attempted, since the graph types are independent.
   */
  async run(context: GraphRunContext): Promise<MapRunResult> {
    const { enabledGraphTypes } = context;
    const nxOutcome = enabledGraphTypes.has(NX_PROJECTS_GRAPH_TYPE)
      ? this.runNxGraphs(context)
      : EMPTY_GRAPH_TYPE_PASS_OUTCOME;
    const nestjsOutcome = enabledGraphTypes.has(NESTJS_MODULES_GRAPH_TYPE)
      ? await this.runNestjsGraphs(context)
      : EMPTY_GRAPH_TYPE_PASS_OUTCOME;
    const importsOutcome = enabledGraphTypes.has(FILE_IMPORTS_GRAPH_TYPE)
      ? this.runImportGraphs(context)
      : EMPTY_GRAPH_TYPE_PASS_OUTCOME;
    const pythonImportsOutcome = enabledGraphTypes.has(FILE_IMPORTS_GRAPH_TYPE)
      ? this.runPythonImportGraphs(context)
      : EMPTY_GRAPH_RUN_OUTCOME;

    return {
      combinedGraphs: this.collectCombinedGraphs({
        importsOutcome,
        nestjsOutcome,
        nxOutcome,
      }),
      outcome: {
        failures: [
          ...nxOutcome.failures,
          ...nestjsOutcome.failures,
          ...importsOutcome.failures,
          ...pythonImportsOutcome.failures,
        ],
        results: [
          ...nxOutcome.results,
          ...nestjsOutcome.results,
          ...importsOutcome.results,
          ...pythonImportsOutcome.results,
        ],
      },
    };
  }

  /**
   * Builds and delivers the file-level import graphs: each project's, then the whole-workspace one.
   */
  runImportGraphs(context: GraphRunContext): GraphTypePassOutcome {
    const { failures, results } =
      this.projectGraphsService.runFileImportsProjects(context);
    const workspaceEntry = this.collectWorkspaceOutcome({
      build: () =>
        this.workspaceGraphsService.runFileImportsWorkspaceGraph(context),
      failures,
      results,
    });

    return { failures, results, workspaceEntry };
  }

  /**
   * Builds and delivers the NestJS module graphs: each project's own graph, and the whole-workspace one.
   */
  async runNestjsGraphs(
    context: GraphRunContext,
  ): Promise<GraphTypePassOutcome> {
    const { failures, results } =
      await this.projectGraphsService.runNestjsModulesProjects(context);

    let workspaceEntry: GraphTypePassOutcome["workspaceEntry"];

    try {
      const workspaceOutcome =
        await this.workspaceGraphsService.runNestjsModulesWorkspaceGraph(
          context,
        );

      workspaceEntry = workspaceOutcome.entry;

      if (workspaceOutcome.result !== undefined) {
        results.push(workspaceOutcome.result);
      }
    } catch (error) {
      failures.push(
        this.collectProjectFailure(WORKSPACE_GRAPH_PROJECT_NAME, error),
      );
    }

    return { failures, results, workspaceEntry };
  }

  /**
   * Builds and delivers every configured Nx graph export — each included
   * project's Neighborhood, from `ProjectGraphsService`, and the
   * whole-workspace Workspace Graph, from `WorkspaceGraphsService`.
   */
  runNxGraphs(context: GraphRunContext): GraphTypePassOutcome {
    const neighborhoods = this.neighborhoodService.buildNeighborhoods(
      context.graph,
      context.projects,
    );
    const { failures, results } = this.projectGraphsService.runNxProjectsGraphs(
      { context, neighborhoods },
    );
    const workspaceEntry = this.collectWorkspaceOutcome({
      build: () => this.workspaceGraphsService.runNxWorkspaceGraph(context),
      failures,
      results,
    });

    return { failures, results, workspaceEntry };
  }

  /**
   * Builds and delivers the Python file-level import graphs. Reports no whole-workspace data: those
   * are already folded into the `fileImports` entry.
   */
  runPythonImportGraphs(context: GraphRunContext): GraphRunOutcome {
    return this.pythonImportsService.runGraphs(context);
  }
}
