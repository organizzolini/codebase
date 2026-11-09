import { existsSync } from "node:fs";
import path from "node:path";

import { CallidescopeService } from "@callidescope/cli";
import {
  ConfigurationService,
  DEFAULT_OUTPUT_FORMAT,
  DEFAULT_PREVIEW_COUNT,
  DEFAULT_RUN_HEADING,
} from "@callidescope/configuration";
import { FileFilterService } from "@callidescope/graph";
import { MarkdownReportService } from "@callidescope/output";
import { Injectable } from "@nestjs/common";

import {
  CALLIDESCOPE_NX_PLUGIN_NAME,
  PROJECT_PROGRAM_FILENAME,
  WORKSPACE_PROJECT_ROOT,
} from "../options/options.constants";
import { OptionsService } from "../options/options.service";
import { ProjectsService } from "../projects/projects.service";
import { RunConfigurationService } from "../run-configuration/run-configuration.service";
import { VerdictService } from "../verdict/verdict.service";

import {
  PROJECT_CONFIGURATION_FILENAME,
  PROJECT_LIMITS_INPUT,
} from "./plugin.constants";

import type { CallidescopePluginOptions } from "../options/options.types";
import type {
  InferredTargets,
  InferTargetsArguments,
  ResolvedTraceScope,
  ResolveTraceScopeArguments,
  RunGateArguments,
  RunGateBatchArguments,
  RunTraceArguments,
  RunTraceResult,
} from "./plugin.types";
import type { TraceOutcome } from "@callidescope/cli";
import type { FileFilter } from "@callidescope/graph";

/**
 * Everything this plugin does, behind one injectable.
 *
 * Nx calls plugins from module-level functions with no injection of their own,
 * so the bare entry points in `index.ts` and the executor build nothing
 * themselves — they resolve this service and hand it the arguments.
 */
@Injectable()
export class PluginService {
  // 🏗 Dependency Injection

  constructor(
    private readonly callidescopeService: CallidescopeService,
    private readonly configurationService: ConfigurationService,
    private readonly fileFilterService: FileFilterService,
    private readonly markdownReportService: MarkdownReportService,
    private readonly optionsService: OptionsService,
    private readonly projectsService: ProjectsService,
    private readonly runConfigurationService: RunConfigurationService,
    private readonly verdictService: VerdictService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Builds the predicate for projects the workspace configuration excludes from every trace.
   * A configuration that cannot load excludes nothing.
   */
  private async buildExclusionFilter(args: {
    configurationPath: string;
    workspaceRoot: string;
  }): Promise<FileFilter> {
    try {
      const { configuration } =
        await this.configurationService.loadConfigurationFile({
          configurationPath: args.configurationPath,
        });

      return this.fileFilterService.buildFileFilter({
        exclude: configuration.exclude,
        excludeFrom: configuration.excludeFrom,
        workspaceRoot: args.workspaceRoot,
      });
    } catch {
      return { isExcluded: (): boolean => false };
    }
  }

  /**
   * Builds one project's targets, with the gate only when the project is not excluded. An
   * excluded gate would pass without reading anything.
   */
  private buildInferredTargets(args: {
    isExcluded: boolean;
    pluginOptions: CallidescopePluginOptions;
  }): InferredTargets {
    const { pluginOptions } = args;
    // The configured limits decide whether a run passes, so a cache hit taken
    // across an edit to them would report the old verdict. A dependency's
    // sources join them through `^default`, because the trace follows the Nx
    // graph into them even though the verdict does not.
    const inputs = [
      "default",
      "^default",
      `{workspaceRoot}/${pluginOptions.configurationPath}`,
    ];
    // Every executor requires the path, so it is written onto each target
    // rather than left for a run to look up: there is nowhere else it could
    // come from, since nothing searches for it.
    const options = { configuration: pluginOptions.configurationPath };
    const targets: InferredTargets = {
      [pluginOptions.breadthTargetName]: {
        cache: true,
        executor: `${CALLIDESCOPE_NX_PLUGIN_NAME}:breadth`,
        inputs,
        options,
      },
      [pluginOptions.depthTargetName]: {
        cache: true,
        executor: `${CALLIDESCOPE_NX_PLUGIN_NAME}:depth`,
        inputs,
        options,
      },
      [pluginOptions.traceTargetName]: {
        cache: true,
        executor: `${CALLIDESCOPE_NX_PLUGIN_NAME}:trace`,
        inputs,
        options,
      },
    };

    if (args.isExcluded) {
      return targets;
    }

    return {
      ...targets,
      [pluginOptions.gateTargetName]: {
        cache: true,
        executor: `${CALLIDESCOPE_NX_PLUGIN_NAME}:gate`,
        inputs: [...inputs, PROJECT_LIMITS_INPUT],
        options,
      },
    };
  }

  /** Whether a project's directory holds a TypeScript program to trace. */
  private holdsProgram(args: {
    projectRoot: string;
    workspaceRoot: string;
  }): boolean {
    return existsSync(
      path.join(args.workspaceRoot, args.projectRoot, PROJECT_PROGRAM_FILENAME),
    );
  }

  /**
   * Whether the workspace configuration excludes this project, judged by its `tsconfig.json`
   * path in POSIX form.
   */
  private isExcludedProject(args: {
    fileFilter: FileFilter;
    projectRoot: string;
  }): boolean {
    return args.fileFilter.isExcluded(
      path.posix.join(args.projectRoot, PROJECT_PROGRAM_FILENAME),
    );
  }

  /**
   * Turns one traced outcome into the gate's result, printing the verdict's findings or its
   * reason. A gate alone fails unread projects.
   */
  private renderGateVerdict(args: {
    judgedProjectNames: readonly string[];
    outcome: TraceOutcome;
  }): RunTraceResult {
    const verdict = this.verdictService.judge({
      judgedProjectNames: args.judgedProjectNames,
      projectLimits: args.outcome.projectLimits,
      result: args.outcome.result,
    });

    return {
      ok: verdict.ok && verdict.unreadProjectNames.length === 0,
      report:
        this.verdictService.explain(verdict) ??
        this.markdownReportService.renderFindings({
          ...verdict.findings,
          // Returned to an executor to print rather than spliced into a
          // document, so no destination's count applies.
          previewCount: DEFAULT_PREVIEW_COUNT,
        }),
    };
  }

  // 🌎 Public Methods

  /**
   * States what a selection asked for that the workspace does not have, naming every typo at once.
   */
  public describeRefusedScope(scope: ResolvedTraceScope): string {
    return [
      scope.unknownNames.length > 0
        ? `Unknown Nx projects: ${scope.unknownNames.join(", ")}. Known: ${scope.knownNames.join(", ")}.`
        : undefined,
      scope.unmatchedTags.length > 0
        ? `Unmatched Nx tags: ${scope.unmatchedTags.join(", ")}. Known: ${scope.knownTags.join(", ")}.`
        : undefined,
    ]
      .filter((reason) => reason !== undefined)
      .join(" ");
  }

  /**
   * Infers this plugin's targets onto every project holding a `tsconfig.json`, skipping the
   * workspace root and projects without a program.
   */
  public async inferTargets(
    args: InferTargetsArguments,
  ): Promise<Map<string, InferredTargets>> {
    const pluginOptions = this.optionsService.resolvePluginOptions(
      args.options,
    );
    const fileFilter = await this.buildExclusionFilter({
      configurationPath: pluginOptions.configurationPath,
      workspaceRoot: args.workspaceRoot,
    });
    const targetsByProjectRoot = new Map<string, InferredTargets>();

    for (const projectConfigurationFile of args.projectConfigurationFiles) {
      if (
        path.basename(projectConfigurationFile) !==
        PROJECT_CONFIGURATION_FILENAME
      ) {
        continue;
      }

      const projectRoot = path.dirname(projectConfigurationFile);

      if (
        projectRoot === WORKSPACE_PROJECT_ROOT ||
        !this.holdsProgram({ projectRoot, workspaceRoot: args.workspaceRoot })
      ) {
        continue;
      }

      targetsByProjectRoot.set(
        projectRoot,
        this.buildInferredTargets({
          isExcluded: this.isExcludedProject({ fileFilter, projectRoot }),
          pluginOptions,
        }),
      );
    }

    return targetsByProjectRoot;
  }

  /**
   * Resolves an executor's `projects`/`tags` selection into directories, widened along the Nx
   * graph unless told not to.
   */
  public async resolveTraceScope(
    args: ResolveTraceScopeArguments,
  ): Promise<ResolvedTraceScope> {
    const graph = await this.projectsService.readProjectGraph();
    const selected = this.projectsService.resolveProjectNames({
      graph,
      projectNames: args.projectNames,
      tags: args.tags,
    });
    const projectNames = args.withDependencies
      ? this.projectsService.resolveDependencyClosure({
          graph,
          projectNames: selected.projectNames,
        })
      : selected.projectNames;

    return {
      directories: this.projectsService.resolveDirectories({
        graph,
        projectNames,
      }).directories,
      knownNames: selected.knownNames,
      knownTags: selected.knownTags,
      projectNames,
      selectedDirectories: this.projectsService.resolveDirectories({
        graph,
        projectNames: selected.projectNames,
      }).directories,
      unknownNames: selected.unknownNames,
      unmatchedTags: selected.unmatchedTags,
    };
  }

  /**
   * Traces the resolved directories and judges the findings against each in-scope project's
   * declared limits.
   */
  public async runGate(args: RunGateArguments): Promise<RunTraceResult> {
    const { configuration, path: configurationPath } =
      await this.runConfigurationService.load(args);
    const outcome = await this.callidescopeService.trace({
      configuration,
      configurationPath,
      directories: args.directories,
      workspaceRoot: args.workspaceRoot,
    });

    return this.renderGateVerdict({
      judgedProjectNames: args.judgedProjectNames,
      outcome,
    });
  }

  /**
   * Gates every task of a batch from one trace of their combined scope, judging each task by
   * the projects it owns.
   */
  public async runGateBatch(
    args: RunGateBatchArguments,
  ): Promise<Record<string, RunTraceResult>> {
    if (args.tasks.length === 0) {
      return {};
    }

    const { configuration, path: configurationPath } =
      await this.runConfigurationService.load(args);
    const outcome = await this.callidescopeService.trace({
      configuration,
      configurationPath,
      directories: [...new Set(args.tasks.flatMap((task) => task.directories))],
      workspaceRoot: args.workspaceRoot,
    });

    return Object.fromEntries(
      args.tasks.map((task) => [
        task.id,
        this.renderGateVerdict({
          judgedProjectNames: task.judgedProjectNames,
          outcome,
        }),
      ]),
    );
  }

  /**
   * Traces the resolved directories and renders the report, judged by the gate's predicate.
   * Unread projects print but do not fail.
   */
  public async runTrace(args: RunTraceArguments): Promise<RunTraceResult> {
    const { configuration, path: loadedPath } =
      await this.runConfigurationService.load(args);
    // Presentation rather than declared: the console format is a
    // per-invocation choice this executor's own flag makes, never something
    // a configuration file writes down.
    const format = args.format ?? DEFAULT_OUTPUT_FORMAT;

    const outcome = await this.callidescopeService.trace({
      configuration,
      configurationPath: loadedPath,
      directories: args.directories,
      workspaceRoot: args.workspaceRoot,
    });

    const verdict = this.verdictService.judge({
      judgedProjectNames: args.judgedProjectNames,
      projectLimits: outcome.projectLimits,
      result: outcome.result,
    });
    const report = this.markdownReportService.renderRun({
      // Returned to an executor to print, not spliced into a file, so there is
      // no destination to take a heading or a description from.
      description: undefined,
      heading: DEFAULT_RUN_HEADING,
      limits: outcome.projectLimits,
      previewCount: DEFAULT_PREVIEW_COUNT,
      rendering: format === "mermaid" ? "diagram" : "tree",
      result: outcome.result,
    });
    const explanation = this.verdictService.explain(verdict);

    return {
      ok: verdict.ok,
      report: explanation === undefined ? report : `${report}\n${explanation}`,
    };
  }
}
