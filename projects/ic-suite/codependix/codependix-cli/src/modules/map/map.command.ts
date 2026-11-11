import path from "node:path";

import {
  BoundaryCheckService,
  RunContextService,
} from "@codependix/boundaries";
import { CHECK_NAMES, ConfigurationService } from "@codependix/configuration";
import {
  CombinedOutputService,
  FORMAT_MARKDOWN,
  FORMAT_NAMES,
  GraphRunService,
  ReportingService,
} from "@codependix/output";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { CONFIG_FLAG_SURFACE } from "./map.constants";

import type {
  BoundaryCheckOutcome,
  BoundaryReportArguments,
  GraphRunContext,
} from "@codependix/boundaries";
import type { MapCommandOptions } from "@codependix/configuration";
import type { CodependixRunMode, RunMode } from "@codependix/core";
import type {
  CombinedGraphExports,
  CombinedOutputFormat,
  MapRunResult,
} from "@codependix/output";

/**
 * CLI entry point for the codependix dependency graph workflow.
 *
 * `--write` publishes every configured export. `--check` fails on `boundaries`
 * (broken rules) and `reports` (stale destinations). Staleness moves with the
 * workspace, so it gates apart from breakage.
 */
@Command({
  description: "Map every configured dependency graph and export it",
  name: "map",
})
@Injectable()
export class MapCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly graphRunService: GraphRunService,
    private readonly boundaryCheckService: BoundaryCheckService,
    private readonly combinedOutputService: CombinedOutputService,
    private readonly configurationService: ConfigurationService,
    private readonly logger: LoggerService,
    private readonly reportingService: ReportingService,
    private readonly runContextService: RunContextService,
  ) {
    super();
    this.logger.setContext(MapCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * What a boundary pass found, added only when `--format` or an output path was given.
   */
  private buildBoundaryReport(args: {
    boundaryOutcome: BoundaryCheckOutcome | undefined;
    context: GraphRunContext;
    options: MapCommandOptions;
  }): BoundaryReportArguments | undefined {
    const { boundaryOutcome, context, options } = args;
    const asked =
      options.format !== undefined ||
      options.jsonOutput !== undefined ||
      options.markdownOutput !== undefined;

    if (boundaryOutcome === undefined || !asked) return undefined;

    return {
      judgedProjects: context.selectedProjects.map((project) => project.name),
      outcome: boundaryOutcome,
    };
  }

  /**
   * Resolves the context every pass reads and warns on unmatched `--projects` or `--tags` entries.
   * Warned first, since a typo narrows silently.
   */
  private async resolveContext(args: {
    mode: CodependixRunMode;
    options: MapCommandOptions;
  }): Promise<GraphRunContext> {
    const context = await this.runContextService.build({
      ...args,
      configuration: this.configurationService.requireConfigurationPath(
        args.options.config,
        CONFIG_FLAG_SURFACE,
      ),
      workingDirectory: path.resolve(args.options.directory ?? process.cwd()),
    });

    this.reportingService.reportUnmatchedSelection(
      this.runContextService.findUnmatchedSelection(context),
    );

    return context;
  }

  /**
   * Writes the combined output: every active graph's data, plus the boundary findings when `buildBoundaryReport` carries them.
   */
  private runCombinedOutput(args: {
    boundaryOutcome: BoundaryCheckOutcome | undefined;
    combinedGraphs: CombinedGraphExports | undefined;
    context: GraphRunContext;
    format: CombinedOutputFormat;
    options: MapCommandOptions;
  }): void {
    const { combinedGraphs, context, options } = args;
    const boundaries = this.buildBoundaryReport({
      boundaryOutcome: args.boundaryOutcome,
      context,
      options,
    });

    if (combinedGraphs === undefined && boundaries === undefined) return;

    this.combinedOutputService.run({
      boundaries,
      format: args.format,
      graphs: combinedGraphs ?? {},
      jsonOutputPath: options.jsonOutput,
      markdownOutputPath: options.markdownOutput,
      workingDirectory: context.workingDirectory,
    });
  }

  /**
   * Runs the export pass and warns when nothing was selected. Returns the whole-workspace graph data too, so combined output needs no second run.
   */
  private async runExports(context: GraphRunContext): Promise<MapRunResult> {
    const result = await this.graphRunService.run(context);

    this.reportingService.reportEmptySelection(
      result.outcome.results.length + result.outcome.failures.length,
    );

    return result;
  }

  /**
   * Runs a resolved mode's passes and reports them. Both run directly to keep `run`'s call stack
   * within the callidescope depth limit.
   */
  private async runMode(args: {
    format: CombinedOutputFormat;
    mode: RunMode;
    options: MapCommandOptions;
  }): Promise<void> {
    const { format, mode, options } = args;
    const context = await this.resolveContext({
      mode: mode.writes ? "write" : "check",
      options,
    });
    const exportRun = this.configurationService.touchesFiles(mode)
      ? await this.runExports(context)
      : undefined;
    const boundaryOutcome = mode.checksBoundaries
      ? await this.boundaryCheckService.run(context)
      : undefined;

    this.runCombinedOutput({
      boundaryOutcome,
      combinedGraphs: exportRun?.combinedGraphs,
      context,
      format,
      options,
    });

    if (
      !this.reportingService.reportPassOutcomes({
        boundaryOutcome,
        exportRun,
        selectedProjects: context.selectedProjects,
      })
    ) {
      process.exitCode = 1;
      return;
    }

    this.reportingService.reportSuccess({
      boundaryOutcome,
      exportOutcome: exportRun?.outcome,
    });
  }

  // 🌎 Public Methods

  /**
   * Parses the findings the run fails on. Runs only when `--check` has a value; a bare `--check` is refused later.
   */
  @Option({
    description: `Fail on a comma-separated set drawn from ${CHECK_NAMES.map((name) => `"${name}"`).join(" and ")}`,
    flags: "--check [check]",
  })
  public parseCheck(value: string): string {
    return value;
  }

  /** Parses the required configuration path from command-line input. */
  @Option({
    description: "Path to the codependix configuration file (required)",
    flags: "--config <config>",
    required: true,
  })
  public parseConfig(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /**
   * Builds `--projects`/`--tags` graphs over the named projects' dependency
   * closure — the default, so this exists only for symmetry with
   * `--no-dependencies`.
   */
  @Option({
    description:
      "Build --check boundaries over the dependencies of the projects --projects or --tags named, reporting their findings as notes (default). No effect without --projects or --tags",
    flags: "--dependencies",
  })
  public parseDependencies(): true {
    return true;
  }

  /** Parses the directory whose Nx workspace this run reads. */
  @Option({
    description: "Directory whose Nx workspace this run reads",
    flags: "-d, --directory [directory]",
  })
  public parseDirectory(value: string | undefined): string {
    return this.configurationService.parsePathOption(value);
  }

  /**
   * Parses `--exclude`, overriding the configured `exclude`. Refused later when the configuration never declared `exclude`.
   */
  @Option({
    description:
      "Comma-separated globs overriding the configured exclude. Refused when exclude was never configured",
    flags: "--exclude [exclude]",
  })
  public parseExclude(value: string | undefined): string[] {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /** Enables the `fileImports` graph type for this run. */
  @Option({
    description: "Build, check, and write the fileImports graph type",
    flags: "--file-imports",
  })
  public parseFileImports(): true {
    return true;
  }

  /**
   * Parses what `--format` prints to standard output. Validated later by `CombinedOutputService.resolveFormat`.
   */
  @Option({
    description: `What to print to standard output, one of ${FORMAT_NAMES.join(" and ")} (default: ${FORMAT_MARKDOWN}). A graph type prints only when this run also configured a workspace destination for it, even if its own toggle flag enabled it. A --check boundaries run adds its findings, under a boundaries key in json and a Boundaries section in markdown`,
    flags: "-f, --format [format]",
  })
  public parseFormat(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /**
   * Parses `--include`, a comma-separated list of globs overriding the
   * configured `include`. Refused later, alongside `--exclude`, when the
   * configuration never declared `include`.
   */
  @Option({
    description:
      "Comma-separated globs overriding the configured include. Refused when include was never configured",
    flags: "--include [include]",
  })
  public parseInclude(value: string | undefined): string[] {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /**
   * Parses `--json-output`, the path to write every active graph type's
   * combined JSON data to, keyed by graph type name.
   */
  @Option({
    description:
      "Write every active graph type's data, combined into one JSON file at this path, keyed by graph type name. A type appears only when this run also configured a workspace destination for it. A --check boundaries run adds its findings under a boundaries key",
    flags: "--json-output [jsonOutput]",
  })
  public parseJsonOutput(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /**
   * Parses `--markdown-output`, the path to write every active graph type's
   * combined, anchor-spliced Markdown diagram to.
   */
  @Option({
    description:
      "Write every active graph type's rendered diagram, combined into one Markdown file at this path. A type appears only when this run also configured a workspace destination for it. A --check boundaries run adds its findings as a Boundaries section",
    flags: "--markdown-output [markdownOutput]",
  })
  public parseMarkdownOutput(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /** Enables the `nestjsModules` graph type for this run. */
  @Option({
    description: "Build, check, and write the nestjsModules graph type",
    flags: "--nestjs-modules",
  })
  public parseNestjsModules(): true {
    return true;
  }

  /**
   * Builds the `--projects`/`--tags` graphs over the named projects alone. Faster, but a finding
   * they inherit from a dependency is no longer noted.
   */
  @Option({
    description:
      "Build --check boundaries over only the projects --projects or --tags named, not their dependencies. No effect without --projects or --tags",
    flags: "--no-dependencies",
  })
  public parseNoDependencies(): false {
    return false;
  }

  /** Disables the `fileImports` graph type for this run. */
  @Option({
    description: "Skip the fileImports graph type for this run",
    flags: "--no-file-imports",
  })
  public parseNoFileImports(): false {
    return false;
  }

  /** Disables the `nestjsModules` graph type for this run. */
  @Option({
    description: "Skip the nestjsModules graph type for this run",
    flags: "--no-nestjs-modules",
  })
  public parseNoNestjsModules(): false {
    return false;
  }

  /** Disables the `nxProjects` graph type for this run. */
  @Option({
    description: "Skip the nxProjects graph type for this run",
    flags: "--no-nx-projects",
  })
  public parseNoNxProjects(): false {
    return false;
  }

  /** Enables the `nxProjects` graph type for this run. */
  @Option({
    description: "Build, check, and write the nxProjects graph type",
    flags: "--nx-projects",
  })
  public parseNxProjects(): true {
    return true;
  }

  /**
   * Parses the projects a run exports for, beyond `include`. Also narrows the Workspace Graph and boundary gate to them.
   */
  @Option({
    description:
      "Comma-separated project names or roots to export for, as globs, beyond those include already selects. Also narrows the Workspace Graph to the named set, and --check boundaries to failing only on findings charged to it",
    flags: "--projects [projects]",
  })
  public parseProjects(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /**
   * Parses the Nx tags a run exports for, matched exactly against a project's
   * own tags. Widens and narrows exactly as `--projects` does.
   */
  @Option({
    description:
      "Comma-separated Nx tags to export for, beyond what include already selects. Narrows the Workspace Graph and --check boundaries to the tagged projects, as --projects does",
    flags: "--tags [tags]",
  })
  public parseTags(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /** Parses the `--write` flag from command-line input. */
  @Option({
    description: "Write every configured export",
    flags: "--write",
  })
  public parseWrite(value: boolean | undefined): boolean {
    return this.configurationService.parseFlagOption(value);
  }

  /**
   * Runs whatever the command line asked for: exports, boundaries, or both. Both passes are weighed
   * independently, so one failure never hides the other's.
   */
  async run(
    _passedParameters: string[],
    options: MapCommandOptions = {},
  ): Promise<void> {
    try {
      const { errors, mode } =
        await this.configurationService.selectMode(options);
      const { errors: formatErrors, format } =
        this.combinedOutputService.resolveFormat(options.format);
      const rejections = [...errors, ...formatErrors];

      if (rejections.length > 0) {
        this.logger.error("🕸️ Rejected the command line", undefined, {
          reasons: rejections,
        });
        process.exitCode = 1;
        return;
      }

      await this.runMode({ format, mode, options });
    } catch (error) {
      this.reportingService.reportFailure(error);
    }
  }
}
