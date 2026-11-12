import { globSync, readFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { codometerReportSchema, REPORT_GLOBS } from "./changes.constants";

import type {
  CodometerReport,
  CollectProjectRowsArguments,
  CollectRowsArguments,
  MetricCollection,
  MetricRow,
  MetricSeverity,
  ProjectReport,
  ReportLimit,
  ReportMetric,
  ReportTarget,
} from "./changes.types";

/**
 * Joins each project's current metrics to the baseline from `main`. Metrics the run did not rebuild keep their baseline value, flagged unmeasured.
 *
 * Every metric is joined, not only bytes, and metrics without a limit are reported, never gated.
 */
@Injectable()
export class ChangesService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(ChangesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Builds the row for a metric only the baseline knows. Verdicts are dropped, so this change is judged by its own numbers.
   */
  private buildBaselineRow(
    metric: ReportMetric,
    project: string,
    removed: boolean,
  ): MetricRow {
    return {
      ...metric,
      baseValue: metric.value,
      breach: undefined,
      empty: false,
      measured: false,
      project,
      removed,
      value: removed ? 0 : metric.value,
    };
  }

  /** Builds the row for a metric this run measured. */
  private buildMeasuredRow(
    metric: ReportMetric,
    baseline: ReportMetric | undefined,
    project: string,
  ): MetricRow {
    return {
      ...metric,
      baseValue: baseline?.value,
      measured: true,
      project,
      removed: false,
    };
  }

  /**
   * Joins one project's current report to its baseline. A baseline metric is removed only if this run rebuilt the project.
   */
  private collectProjectRows(
    args: CollectProjectRowsArguments,
  ): MetricCollection {
    const project = this.readProjectName(args.reportPath);
    const baseline = this.readBaseline(args);
    const { failures, metrics } = this.readReport(
      args.workingDirectory,
      args.reportPath,
    );

    const rows = metrics.map((metric) =>
      this.buildMeasuredRow(metric, baseline.get(metric.name), project),
    );
    const seen = new Set(rows.map((row) => row.name));

    for (const [name, metric] of baseline) {
      if (seen.has(name)) continue;
      rows.push(this.buildBaselineRow(metric, project, metrics.length > 0));
    }

    return {
      failures: failures.map((failure) => ({ ...failure, project })),
      rows,
    };
  }

  /** Parses the report's JSON body, tolerating an absent or malformed file. */
  private parseReport(
    workingDirectory: string,
    reportPath: string,
  ): CodometerReport | undefined {
    try {
      const parsed = codometerReportSchema.safeParse(
        JSON.parse(
          readFileSync(path.join(workingDirectory, reportPath), "utf8"),
        ),
      );
      return parsed.success ? parsed.data : undefined;
    } catch {
      return undefined;
    }
  }

  /** Reads a baseline report into a name-to-metric lookup. */
  private readBaseline(
    args: CollectProjectRowsArguments,
  ): Map<string, ReportMetric> {
    if (args.baselineDirectory === undefined) return new Map();
    // Only the values are taken from the baseline. Whatever the run on `main`
    // could not measure is that run's problem and was reported there; repeating
    // it here would blame this change for it.
    const { metrics } = this.readReport(
      args.workingDirectory,
      path.join(args.baselineDirectory, args.reportPath),
    );
    return new Map(metrics.map((metric) => [metric.name, metric]));
  }

  /**
   * The worst severity a metric breached: `fail` outranks `warn`, so a metric past both reads as failing.
   */
  private readBreach(
    limits: readonly ReportLimit[],
  ): MetricSeverity | undefined {
    const breached = limits.filter((limit) => limit.breached);

    if (breached.length === 0) return undefined;

    return breached.some((limit) => limit.severity === "fail")
      ? "fail"
      : "warn";
  }

  /**
   * The limit a metric is held to: the lowest `fail` limit, or else its lowest `warn` limit, so advice still reports a limit.
   */
  private readGoverningLimit(
    limits: readonly ReportLimit[],
  ): number | undefined {
    const failing = limits.filter((limit) => limit.severity === "fail");
    const governing = failing.length > 0 ? failing : limits;
    const values = governing.map((limit) => limit.value);

    return values.length === 0 ? undefined : Math.min(...values);
  }

  /** The first label any limit wrote, which names the row in the table. */
  private readLabel(limits: readonly ReportLimit[]): string | undefined {
    return limits.find((limit) => limit.label !== null)?.label ?? undefined;
  }

  /**
   * Pulls every metric a target produced out of the report, labelled by its limit's name, else its own dotted name.
   */
  private readMetrics(target: ReportTarget): ReportMetric[] {
    return target.metrics.map((metric) => ({
      breach: this.readBreach(metric.limits),
      empty: target.empty,
      label: this.readLabel(metric.limits) ?? metric.name,
      limit: this.readGoverningLimit(metric.limits),
      name: metric.name,
      unit: metric.unit,
      value: metric.value,
    }));
  }

  /** Derives the Nx project name from a report path. */
  private readProjectName(reportPath: string): string {
    const directory = path.dirname(reportPath);
    return directory === "." || directory === ""
      ? "codebase"
      : path.basename(directory);
  }

  /** Parses a codometer report, tolerating an absent or malformed file. */
  private readReport(
    workingDirectory: string,
    reportPath: string,
  ): ProjectReport {
    const report = this.parseReport(workingDirectory, reportPath);

    if (report === undefined) {
      this.logger.warn("⚠️ Skipped an unreadable codometer report", undefined, {
        reportPath,
        workingDirectory,
      });
      return { failures: [], metrics: [] };
    }

    return {
      failures: report.failures ?? [],
      metrics: report.targets.flatMap((target) => this.readMetrics(target)),
    };
  }

  /**
   * Lists every report path either side knows about, so a project the baseline
   * measured is still accounted for when this run skipped it.
   */
  private readReportPaths(args: CollectRowsArguments): string[] {
    const { baselineDirectory, workingDirectory } = args;
    const current = REPORT_GLOBS.flatMap((pattern) =>
      globSync(pattern, { cwd: workingDirectory }),
    );
    const baseline =
      baselineDirectory === undefined
        ? []
        : REPORT_GLOBS.flatMap((pattern) =>
            globSync(path.join(baselineDirectory, pattern), {
              cwd: workingDirectory,
            }),
          ).map((reportPath) => path.relative(baselineDirectory, reportPath));

    this.logger.debug("📂 Found the codometer reports", undefined, {
      baseline: baseline.length,
      current: current.length,
    });

    return [...new Set([...current, ...baseline])].toSorted();
  }

  // 🌎 Public Methods

  /** Joins every current report to the baseline snapshot. */
  collect(args: CollectRowsArguments): MetricCollection {
    const collections = this.readReportPaths(args).map((reportPath) =>
      this.collectProjectRows({ ...args, reportPath }),
    );

    return {
      failures: collections.flatMap((collection) => collection.failures),
      rows: collections.flatMap((collection) => collection.rows),
    };
  }
}
