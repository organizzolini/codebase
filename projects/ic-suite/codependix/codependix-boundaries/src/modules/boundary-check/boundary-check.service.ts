import { PythonService, TypescriptService } from "@codependix/file-imports";
import {
  ModuleGraphService,
  NestjsProjectService,
} from "@codependix/nestjs-modules";
import { WorkspaceGraphService } from "@codependix/nx-projects";
import { Injectable } from "@nestjs/common";

import { BoundariesService } from "../boundaries/boundaries.service";

import {
  BOUNDARY_LEVEL_ORDER,
  WORKSPACE_SCOPE,
} from "./boundary-check.constants";
import { BoundaryFailureService } from "./boundary-failure.service";
import { BoundaryGraphService } from "./boundary-graph.service";

import type {
  BoundaryGraph,
  BoundaryViolation,
  CodependixBoundaryLevel,
} from "../boundaries/boundaries.types";
import type {
  BoundaryCheckContext,
  BoundaryCheckFailure,
  BoundaryCheckOutcome,
  BoundaryLevelOutcome,
  BoundaryVerdict,
  LevelCheckArguments,
} from "./boundary-check.types";
import type {
  CodependixBoundaryRule,
  CodependixGraphType,
  ResolvedCodependixBoundariesConfiguration,
} from "@codependix/configuration";

/**
 * Judges every level's graph against its declared rules. A level with no rules is never built,
 * keeping the gate affordable. Writes nothing: findings go to the console and exit code, leaving
 * committed exports untouched.
 */
@Injectable()
export class BoundaryCheckService {
  // 🏗 Dependency Injection

  constructor(
    private readonly boundariesService: BoundariesService,
    private readonly boundaryFailureService: BoundaryFailureService,
    private readonly boundaryGraphService: BoundaryGraphService,
    private readonly moduleGraphService: ModuleGraphService,
    private readonly nestjsProjectService: NestjsProjectService,
    private readonly pythonService: PythonService,
    private readonly typescriptService: TypescriptService,
    private readonly workspaceGraphService: WorkspaceGraphService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The graph type each level is judged under. `python` and `typescript` both fall under
   * `fileImports`, so `--no-file-imports` skips both.
   */
  private graphTypeForLevel(
    level: CodependixBoundaryLevel,
  ): CodependixGraphType {
    const graphTypesByLevel: Record<
      CodependixBoundaryLevel,
      CodependixGraphType
    > = {
      nestjsModules: "nestjsModules",
      nxProjects: "nxProjects",
      python: "fileImports",
      typescript: "fileImports",
    };

    return graphTypesByLevel[level];
  }

  /**
   * Judges every charged finding: it fails the run when a charged project is judged, else it is a note.
   */
  private judge(
    outcome: BoundaryLevelOutcome,
    context: BoundaryCheckContext,
  ): BoundaryCheckOutcome {
    const judged = new Set(
      context.selectedProjects.map((project) => project.name),
    );

    return {
      failures: outcome.failures.map((failure) => ({
        ...failure,
        verdict: this.resolveVerdict(failure.projects, judged),
      })),
      violations: outcome.violations.map((violation) => ({
        ...violation,
        verdict: this.resolveVerdict(violation.projects, judged),
      })),
    };
  }

  /** `"fail"` when any charged project is judged, and `"note"` otherwise. */
  private resolveVerdict(
    projects: readonly string[],
    judged: ReadonlySet<string>,
  ): BoundaryVerdict {
    return projects.some((project) => judged.has(project)) ? "fail" : "note";
  }

  /**
   * Resolves one level's rules from the nested shape. Keyed by level, so a new level fails to compile.
   */
  private rulesForLevel(
    boundaries: ResolvedCodependixBoundariesConfiguration,
    level: CodependixBoundaryLevel,
  ): readonly CodependixBoundaryRule[] {
    const rulesByLevel: Record<
      CodependixBoundaryLevel,
      readonly CodependixBoundaryRule[]
    > = {
      nestjsModules: boundaries.nestjsModules,
      nxProjects: boundaries.nxProjects,
      python: boundaries.fileImports.python,
      typescript: boundaries.fileImports.typescript,
    };

    return rulesByLevel[level];
  }

  /**
   * Builds one level's findings with whichever builder it needs.
   */
  private async runLevel(
    args: LevelCheckArguments,
  ): Promise<BoundaryLevelOutcome> {
    const runners: Record<
      CodependixBoundaryLevel,
      (
        levelArguments: LevelCheckArguments,
      ) => BoundaryLevelOutcome | Promise<BoundaryLevelOutcome>
    > = {
      nestjsModules: async (levelArguments) =>
        this.runNestjsLevel(levelArguments),
      nxProjects: (levelArguments) => this.runNxLevel(levelArguments),
      python: async (levelArguments) =>
        this.runPythonImportsLevel(levelArguments),
      typescript: async (levelArguments) =>
        this.runTypescriptImportsLevel(levelArguments),
    };

    return runners[args.level](args);
  }

  /** Judges every `framework:nestjs` project's module graph. */
  private async runNestjsLevel(
    args: LevelCheckArguments,
  ): Promise<BoundaryLevelOutcome> {
    return this.runProjectLevel({
      buildGraph: async (project) =>
        this.boundaryGraphService.buildNestjsGraph(
          this.moduleGraphService.buildGraph(
            await this.nestjsProjectService.exploreProject(project),
            project.name,
          ),
        ),
      levelArguments: args,
      projects: this.nestjsProjectService.discoverProjects(
        args.context.buildProjects,
        args.context.configuration.nestjsRootModules,
      ),
    });
  }

  /**
   * Judges the whole-workspace Nx graph over the build set. A graph that cannot be built is charged
   * to every judged project.
   */
  private runNxLevel(args: LevelCheckArguments): BoundaryLevelOutcome {
    const { context, level, rules } = args;

    try {
      const graph = this.boundaryGraphService.buildNxGraph({
        projects: context.buildProjects,
        scope: WORKSPACE_SCOPE,
        workingDirectory: context.workingDirectory,
        workspaceGraph: this.workspaceGraphService.buildWorkspaceGraph(
          context.graph,
          context.buildProjects,
        ),
      });

      return {
        failures: [],
        violations: this.boundariesService.evaluate({ graph, rules }),
      };
    } catch (error) {
      return {
        failures: [
          this.boundaryFailureService.collect({
            error,
            graph: context.graph,
            level,
            projects: context.selectedProjects.map((project) => project.name),
            workspaceProjects: context.projects,
          }),
        ],
        violations: [],
      };
    }
  }

  /**
   * Judges each build-set project at one level, isolating failures per project so one raise
   * does not stop the rest.
   */
  private async runProjectLevel<Project extends { name: string }>(args: {
    buildGraph: (project: Project) => BoundaryGraph | Promise<BoundaryGraph>;
    levelArguments: LevelCheckArguments;
    projects: readonly Project[];
  }): Promise<BoundaryLevelOutcome> {
    const { context, level, rules } = args.levelArguments;
    const failures: BoundaryCheckFailure[] = [];
    const violations: BoundaryViolation[] = [];

    for (const project of args.projects) {
      try {
        const graph = await args.buildGraph(project);

        violations.push(...this.boundariesService.evaluate({ graph, rules }));
      } catch (error) {
        failures.push(
          this.boundaryFailureService.collect({
            error,
            graph: context.graph,
            level,
            projects: [project.name],
            workspaceProjects: context.projects,
          }),
        );
      }
    }

    return { failures, violations };
  }

  /** Judges every `language:python` project's file-level import graph. */
  private async runPythonImportsLevel(
    args: LevelCheckArguments,
  ): Promise<BoundaryLevelOutcome> {
    return this.runProjectLevel({
      buildGraph: (project) =>
        this.boundaryGraphService.buildPythonImportGraph(
          this.pythonService.buildGraph(project),
        ),
      levelArguments: args,
      projects: this.pythonService.discoverProjects(args.context.buildProjects),
    });
  }

  /** Judges every TypeScript project's file-level import graph. */
  private async runTypescriptImportsLevel(
    args: LevelCheckArguments,
  ): Promise<BoundaryLevelOutcome> {
    return this.runProjectLevel({
      buildGraph: (project) =>
        this.boundaryGraphService.buildTypescriptImportGraph(
          this.typescriptService.buildGraph(
            this.typescriptService.buildProgram(project),
          ),
        ),
      levelArguments: args,
      projects: this.typescriptService.discoverProjects(
        args.context.buildProjects,
      ),
    });
  }

  // 🌎 Public Methods

  /**
   * Judges every level with rules and an enabled graph type. A level is skipped before any graph is
   * built, so `--no-nestjs-modules` boots no container.
   */
  public async run(
    context: BoundaryCheckContext,
  ): Promise<BoundaryCheckOutcome> {
    const { boundaries } = context.configuration;
    const outcomes: BoundaryLevelOutcome[] = [];

    for (const level of BOUNDARY_LEVEL_ORDER) {
      if (!context.enabledGraphTypes.has(this.graphTypeForLevel(level))) {
        continue;
      }

      const rules = this.rulesForLevel(boundaries, level);

      if (rules.length > 0) {
        outcomes.push(await this.runLevel({ context, level, rules }));
      }
    }

    return this.judge(
      {
        failures: outcomes.flatMap((outcome) => outcome.failures),
        violations: outcomes.flatMap((outcome) => outcome.violations),
      },
      context,
    );
  }
}
