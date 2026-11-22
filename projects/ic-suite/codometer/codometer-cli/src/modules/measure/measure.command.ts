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

import {
  applyInputsOverride,
  describeFindings,
  enforcedFailures,
  scopeToMode,
} from "./measure.utilities";

import type {
  MeasureOutcome,
  MeasureVerdict,
  ReportFindingsArguments,
  RunPlan,
  RunRejection,
} from "./measure.types";
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
   * Measure one directory and say whether the run failed, and why. Sets no
   * exit code, so many directories can be measured in one process.
   */
  private async measureDirectory(
    options: MeasureCommandOptions,
    workingDirectory: string,
  ): Promise<MeasureOutcome> {
    const plan = await this.resolveRunPlan(options, workingDirectory);

    if ("rejected" in plan) {
      return { failed: true, report: plan.rejected.join("\n") };
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

    const findings = { measurement, mode, stalePaths };
    const failed = this.reportFindings(findings);

    return { failed, report: failed ? describeFindings(findings) : "" };
  }

  /**
   * Read the configuration, or report why it could not be read and say so.
   * `--config` is required; no file is searched for.
   */
  private async readConfiguration(
    options: MeasureCommandOptions,
  ): Promise<ResolvedCodometerConfiguration | RunRejection> {
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
      const reason = error instanceof Error ? error.message : String(error);

      this.logger.error(`📊 Rejected the configuration`, undefined, { reason });

      return { rejected: [reason] };
    }
  }

  /** Says the command line could not be made sense of, and why. */
  private rejectCommandLine(reasons: string[]): RunRejection {
    this.logger.error(`📊 Rejected the command line`, undefined, { reasons });

    return { rejected: reasons };
  }

  /** Report every breached limit, and say whether one the run checks fails it. */
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

    return enforcedFailures(args).length > 0;
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
      args.mode.checksWeigh ||
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
   * Reads the flags into the mode, configuration, print format, and output destinations. Returns the reasons after reporting a refusal, so callers stop there.
   */
  private async resolveRunPlan(
    options: MeasureCommandOptions,
    workingDirectory: string,
  ): Promise<RunPlan | RunRejection> {
    const { errors: modeErrors, mode } =
      this.configurationService.selectMode(options);

    if (modeErrors.length > 0) {
      return this.rejectCommandLine(modeErrors);
    }

    const loadedConfiguration = await this.readConfiguration(options);

    if ("rejected" in loadedConfiguration) {
      return loadedConfiguration;
    }

    const configuration = scopeToMode(
      applyInputsOverride(loadedConfiguration, options.inputs),
      mode,
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
      return this.rejectCommandLine([...formatErrors, ...destinationErrors]);
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

  // 🌎 Public Methods

  /**
   * Parses the set of checks to fail on. A `--check` with no value is refused later rather than silently becoming write mode.
   */
  @Option({
    description: `Fail on a comma-separated set drawn from "limits" (the source tree), "weigh" (the declared builds) and "reports"`,
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

  /**
   * Measure the working directory, or each named directory, and fail on any
   * failed run. Named directories avoid repeated start-up.
   */
  async run(
    directories: string[],
    options: MeasureCommandOptions,
  ): Promise<void> {
    if (directories.length === 0) {
      const outcome = await this.measureDirectory(
        options,
        this.resolveWorkingDirectory(),
      );

      process.exitCode = outcome.failed ? 1 : process.exitCode;

      return;
    }

    const verdicts: MeasureVerdict[] = [];

    for (const directory of directories.map((named) => path.resolve(named))) {
      const outcome = await this.measureDirectory(
        options.config === undefined
          ? options
          : { ...options, config: path.resolve(directory, options.config) },
        directory,
      ).catch((error: unknown) => {
        const reason = error instanceof Error ? error.message : String(error);

        this.logger.error(`📊 Failed to measure ${directory}`, undefined, {
          reason,
        });

        return { failed: true, report: reason };
      });

      process.exitCode = outcome.failed ? 1 : process.exitCode;
      verdicts.push({ directory, ok: !outcome.failed, report: outcome.report });
    }

    // One directory keeps standard output for its report; a caller measuring
    // several has no single report to pipe, and needs to know who failed.
    if (verdicts.length > 1) {
      process.stdout.write(`${JSON.stringify(verdicts)}\n`);
    }
  }
}
