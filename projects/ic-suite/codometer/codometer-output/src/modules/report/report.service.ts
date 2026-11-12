import { Injectable } from "@nestjs/common";

import { METRIC_NAME_SEPARATOR, SIZE_METRIC_PATH } from "./report.constants";

import type { BuildReportArguments } from "./report.types";
import type {
  CodometerReport,
  MetricUnit,
  ReportLimit,
  ReportMetric,
  ReportTarget,
} from "@codometer/core";
import type { EvaluatedLimit, TargetMetricIndex } from "@codometer/measurement";

/**
 * Writes out what a run measured, in codometer's own shape.
 *
 * Every metric and every limit is listed, breached or not, so one document answers what a repository is and what it is held to.
 */
@Injectable()
export class ReportService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Writes out one limit as the report carries it. */
  private buildLimit(limit: EvaluatedLimit): ReportLimit {
    return {
      breached: limit.breached,
      label: limit.label ?? null,
      severity: limit.severity,
      value: limit.limit,
    };
  }

  /** The name a metric answers to across runs. */
  private buildMetricName(target: string, metric: string): string {
    return `${target}${METRIC_NAME_SEPARATOR}${metric}`;
  }

  /** Writes out every metric one target measured, in the order counted. */
  private buildMetrics(args: {
    index: TargetMetricIndex;
    limits: ReadonlyMap<string, EvaluatedLimit[]>;
    target: string;
  }): ReportMetric[] {
    const metrics: ReportMetric[] = [];

    for (const [path, value] of args.index.metrics) {
      const name = this.buildMetricName(args.target, path);

      metrics.push({
        instances: args.index.instances.get(path) ?? null,
        limits: (args.limits.get(name) ?? []).map((limit) =>
          this.buildLimit(limit),
        ),
        name,
        path,
        unit: this.readUnit(path),
        value,
      });
    }

    return metrics;
  }

  /**
   * Indexes the evaluated limits by the metric each one lands on. Several limits may land on one metric, so all are kept.
   */
  private indexLimits(
    limits: readonly EvaluatedLimit[],
  ): Map<string, EvaluatedLimit[]> {
    const indexed = new Map<string, EvaluatedLimit[]>();

    for (const limit of limits) {
      const name = this.buildMetricName(limit.target, limit.metric);
      const existing = indexed.get(name);

      if (existing === undefined) {
        indexed.set(name, [limit]);
      } else {
        existing.push(limit);
      }
    }

    return indexed;
  }

  /** What a metric's number counts, where that is anything but things. */
  private readUnit(metric: string): MetricUnit {
    return metric === SIZE_METRIC_PATH ? "bytes" : null;
  }

  // 🌎 Public Methods

  /**
   * Builds the report for one measurement. Ordering is fixed, so two runs over one tree produce identical documents.
   */
  build(args: BuildReportArguments): CodometerReport {
    const limits = this.indexLimits(args.limits);
    const targets: ReportTarget[] = [];

    for (const [target, index] of args.indexes) {
      targets.push({
        empty: index.files === 0,
        files: index.files,
        metrics: this.buildMetrics({ index, limits, target }),
        name: target,
      });
    }

    return {
      failures: [...args.failures],
      targets,
    };
  }
}
