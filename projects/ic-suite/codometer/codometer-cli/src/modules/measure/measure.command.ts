import path from "node:path";

import { ConfigurationService, FORMAT_NAMES } from "@codometer/configuration";
import { MeasureService } from "@codometer/measurement";
import {
  DeliveryService,
  DestinationsService,
  ReportService,
} from "@codometer/output";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import type { ReportFindingsArguments, RunPlan } from "./measure.types";
import type {
  MeasureCommandOptions,
  ResolvedCodometerConfiguration,
} from "@codometer/configuration";
import type { MeasurementResult } from "@codometer/measurement";

/**
 * CLI entry point for the repository measurement workflow.
 */
@Command({
  arguments: "[directories...]",
  description:
    "Measure the working directory, or each directory named, and produce every resolved output",
  name: "measure",
})
@Injectable()
export class MeasureCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly measureService: MeasureService,
    private readonly deliveryService: DeliveryService,
    private readonly reportService: ReportService,
    private readonly destinationsService: DestinationsService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(MeasureCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Says which files were left out because codometer writes them, so a missing file does not read as a measurement bug.
   */
  private announceOutputPaths(outputPaths: string[]): void {
    if (outputPaths.length === 0) {
      return;
    }

    this.logger.info(
      `📊 Excluded the files codometer writes from what it measures`,
      undefined,
      { paths: outputPaths },
    );
  }

  /**
   * Replaces every configured input with the `--inputs` globs, measured as the `language` analysis with no other input active.
   */
  private applyInputsOverride(
    configuration: ResolvedCodometerConfiguration,
    globs: string[] | undefined,
  ): ResolvedCodometerConfiguration {
    if (globs === undefined) {
      return configuration;
    }

    return {
      ...configuration,
      inputs: [
        {
          analyses: ["language"],
          compression: "none",
          directory: ".",
          exclude: [],
          include: globs,
          name: "Command Line",
        },
      ],
    };
  }

  /**
   * Measure one directory and produce every resolved output, returning whether
   * the run failed.
   *
   * Nothing here reads the working directory or sets the exit code, so `run`
   * can measure many directories in one process and weigh each one's verdict
   * on its own. `options.config` should be absolute, since a relative path is
   * read against the process's working directory.
   *
   * Flags are independent: `--output-json`/`--output-markdown` each write
   * their own destination, `--check reports` fails on a stale report,
   * `--check limits` fails on a breached limit, `--format` prints, and none of
   * them turns another on. Every output is produced before any finding is
   * weighed, so a run that writes and gates leaves the report behind even
   * when the gate trips.
   */
  private async measureDirectory(
    options: MeasureCommandOptions,
    workingDirectory: string,
  ): Promise<boolean> {
    const plan = await this.resolveRunPlan(options, workingDirectory);

    if (plan === undefined) {
      return true;
    }

    const { configuration, consoleMarkdown, destinations, format, mode } = plan;
    const outputPaths = this.destinationsService.listOutputPaths({
      destinations,
      workingDirectory,
    });

    this.announceOutputPaths(outputPaths);

    const measurement: MeasurementResult = this.measureService.measure({
      configuration,
      outputPaths,
      workingDirectory,
    });
    const report = this.reportService.build(measurement);
    const stalePaths = this.deliveryService.deliver({
      consoleMarkdown,
      destinations,
      format,
      measurement,
      mode,
      report,
      scope: this.destinationsService.selectScope(workingDirectory),
    });

    return this.reportFindings({ measurement, mode, stalePaths });
  }

  /**
   * Read the configuration, or say why it could not be read.
   *
   * Reports the reason and returns `undefined` rather than failing the process:
   * whoever called `measureDirectory` decides what a refused run costs.
   *
   * `--config` is required: no file is searched for and none is assumed, so a
   * run without it fails naming the flag, and so does a path that names no
   * file or a configuration nothing can parse. A shared default object,
   * spread by each project's own `codometer.config.ts`, is what states
   * `format` once for a workspace.
   */
  private async readConfiguration(
    options: MeasureCommandOptions,
  ): Promise<ResolvedCodometerConfiguration | undefined> {
    try {
      const configurationPath =
        this.configurationService.requireConfigurationPath(
          options.config,
          "--config",
        );

      const configuration = await this.configurationService.loadConfiguration({
        configurationPath,
      });

      this.logger.debug("🗂️ Loaded the configuration", undefined, {
        configuredPath: configurationPath,
      });

      return configuration;
    } catch (error: unknown) {
      this.logger.error(`📊 Rejected the configuration`, undefined, {
        reason: error instanceof Error ? error.message : String(error),
      });
      return undefined;
    }
  }

  /** Says the command line could not be made sense of. */
  private rejectCommandLine(reasons: string[]): void {
    this.logger.error(`📊 Rejected the command line`, undefined, { reasons });
  }

  /** Report every breached limit, and say whether one of them fails the run. */
  private reportBreaches(args: ReportFindingsArguments): boolean {
    const breached = args.measurement.limits.filter((limit) => limit.breached);
    const failing = breached.filter((limit) => limit.severity === "fail");
    const warning = breached.filter((limit) => limit.severity === "warn");

    if (warning.length > 0) {
      this.logger.warn(`📊 Breached a warning limit`, undefined, {
        limits: warning,
      });
    }

    if (failing.length > 0) {
      this.logger.error(`📊 Breached a failing limit`, undefined, {
        limits: failing,
      });
    }

    return args.mode.checksLimits && failing.length > 0;
  }

  /**
   * Reports what the run could not measure. Says whether it fails the run: writing or gating outputs cannot pass on partial data.
   */
  private reportFailures(args: ReportFindingsArguments): boolean {
    if (args.measurement.failures.length === 0) {
      return false;
    }

    this.logger.error(`📊 Failed to measure part of the run`, undefined, {
      failures: args.measurement.failures,
    });

    return (
      args.mode.checksLimits ||
      args.mode.checksReports ||
      args.mode.writesJson ||
      args.mode.writesMarkdown
    );
  }

  /** Weigh every finding, say the run is done, and say whether it failed. */
  private reportFindings(args: ReportFindingsArguments): boolean {
    const failed = this.reportFailures(args);
    const stale = this.reportStaleness(args);
    const breached = this.reportBreaches(args);

    this.logger.info("✅ Finished the measurement run", undefined, {
      breachCount: args.measurement.limits.filter((limit) => limit.breached)
        .length,
      inputCount: args.measurement.inputs.length,
    });

    return failed || stale || breached;
  }

  /** Report every stale destination, and say whether that fails the run. */
  private reportStaleness(args: ReportFindingsArguments): boolean {
    if (args.stalePaths.length === 0) {
      return false;
    }

    this.logger.error(`📊 Found stale reports`, undefined, {
      paths: args.stalePaths,
    });

    return true;
  }

  /**
   * Reads the flags into the mode, configuration, print format, and output destinations. Returns `undefined` after reporting a refusal, so callers stop there.
   */
  private async resolveRunPlan(
    options: MeasureCommandOptions,
    workingDirectory: string,
  ): Promise<RunPlan | undefined> {
    const { errors: modeErrors, mode } =
      this.configurationService.selectMode(options);

    if (modeErrors.length > 0) {
      this.rejectCommandLine(modeErrors);
      return undefined;
    }

    const loadedConfiguration = await this.readConfiguration(options);

    if (loadedConfiguration === undefined) {
      return undefined;
    }

    const configuration = this.applyInputsOverride(
      loadedConfiguration,
      options.inputs,
    );
    const formatErrors: string[] = [];
    const format = this.configurationService.resolveFormat(
      options.format,
      configuration.format,
      formatErrors,
    );
    const { destinations, errors: destinationErrors } =
      this.destinationsService.resolveDestinations({
        configuration,
        options,
        workingDirectory,
      });

    if (formatErrors.length > 0 || destinationErrors.length > 0) {
      this.rejectCommandLine([...formatErrors, ...destinationErrors]);
      return undefined;
    }

    const consoleMarkdown = this.destinationsService.resolveConsoleMarkdown({
      configuration,
      options,
      workingDirectory,
    });

    return { configuration, consoleMarkdown, destinations, format, mode };
  }

  /**
   * Returns the process's working directory, the only directory a run can measure: no flag overrides it.
   */
  private resolveWorkingDirectory(): string {
    const workingDirectory = path.resolve(process.cwd());

    this.logger.debug("🚀 Started the measurement run", undefined, {
      directory: workingDirectory,
    });

    return workingDirectory;
  }

  /**
   * Parses the set of checks to fail on. A `--check` with no value is refused later rather than silently becoming write mode.
   */
  @Option({
    description: `Fail on a comma-separated set drawn from "reports" and "limits"`,
    flags: "--check [check]",
  })
  public parseCheck(value: string): string {
    return value;
  }

  /**
   * Parses the required configuration path, so the command line refuses a run without it.
   */
  @Option({
    description: "Path to the codometer configuration file (required)",
    flags: "--config <config>",
    required: true,
  })
  public parseConfig(value: string): string {
    return value;
  }

  /**
   * Parses what the run prints to standard output. Omitted, the configuration's `format` is used, not one inferred from other flags.
   */
  @Option({
    description: `What to print to standard output, one of ${FORMAT_NAMES.join(" and ")}`,
    flags: "-f, --format <format>",
  })
  public parseFormat(value: string): string {
    return value;
  }

  /**
   * Parses one glob, accumulating them into the array that replaces every configured input.
   */
  @Option({
    description:
      "Glob array measured in place of every configured input, with no configured input — not even the built-in codebase one — active",
    flags: "--inputs [globs...]",
  })
  public parseInputs(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /**
   * Parses the JSON report destination. `true` when no path is given, meaning the configured path is used.
   */
  @Option({
    description:
      "Write the JSON report, at the given path or the configured one",
    flags: "--output-json [outputJson]",
  })
  public parseOutputJson(value: string | true): string | true {
    return value;
  }

  /**
   * Parses the markdown badge destination. `true` when no path is given, meaning the configured path is used.
   */
  @Option({
    description:
      "Write the markdown badge block, at the given path or the configured one",
    flags: "--output-markdown [outputMarkdown]",
  })
  public parseOutputMarkdown(value: string | true): string | true {
    return value;
  }

  // 🌎 Public Methods

  /**
   * Measure the process's working directory, or each directory named, and fail
   * the process when any run failed.
   *
   * Directories are named only by a caller that would otherwise start this
   * command once per directory and pay its start-up each time. Each is
   * measured exactly as a run started inside it would be, with `--config`
   * read against that directory, and one that throws fails its own run
   * without stopping the rest. Without any, a throw is the command line's to
   * report, as it always was.
   */
  async run(
    directories: string[],
    options: MeasureCommandOptions,
  ): Promise<void> {
    if (directories.length === 0) {
      if (
        await this.measureDirectory(options, this.resolveWorkingDirectory())
      ) {
        process.exitCode = 1;
      }

      return;
    }

    for (const directory of directories.map((named) => path.resolve(named))) {
      try {
        const failed = await this.measureDirectory(
          options.config === undefined
            ? options
            : { ...options, config: path.resolve(directory, options.config) },
          directory,
        );

        process.exitCode = failed ? 1 : process.exitCode;
      } catch (error: unknown) {
        this.logger.error(`📊 Failed to measure ${directory}`, undefined, {
          reason: error instanceof Error ? error.message : String(error),
        });
        process.exitCode = 1;
      }
    }
  }
}
