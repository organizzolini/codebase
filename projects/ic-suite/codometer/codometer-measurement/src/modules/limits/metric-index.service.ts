import { Injectable } from "@nestjs/common";

import {
  CUSTOM_METRIC_PREFIX,
  FILES_METRIC_PATH,
  METRIC_PATH_SEPARATOR,
  SIZE_METRIC_PATH,
} from "./limits.constants";

import type {
  AddMetricArguments,
  DuplicateTargetFinding,
  MeasuredTarget,
  MetricIndexResult,
  TargetMetricIndex,
} from "./limits.types";
import type { CodeStatisticsResult } from "@codometer/core";

/**
 * Makes every measured number addressable by a dotted path.
 *
 * One index answers both which metric a limit targets and which metrics the
 * report lists. Both need every number named the same way, so the naming lives
 * here, not in either caller.
 */
@Injectable()
export class MetricIndexService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Records one metric. A path already answered is marked ambiguous, so a limit addressing it is refused rather than given the first counter.
   */
  private addMetric(args: AddMetricArguments): void {
    if (args.index.metrics.has(args.metricPath)) {
      args.index.ambiguous.add(args.metricPath);
      return;
    }

    args.index.metrics.set(args.metricPath, args.value);

    if (args.instances !== undefined) {
      args.index.instances.set(args.metricPath, args.instances);
    }
  }

  /**
   * Indexes every metric one target measured, by path. An analysis the target never ran is refused, not compared as zero.
   */
  private buildTargetIndex(target: MeasuredTarget): TargetMetricIndex {
    const index: TargetMetricIndex = {
      ambiguous: new Set(),
      files: target.files,
      instances: new Map(),
      metrics: new Map(),
    };

    this.addMetric({
      index,
      metricPath: FILES_METRIC_PATH,
      value: target.files,
    });

    if (target.size !== undefined) {
      this.addMetric({
        index,
        metricPath: SIZE_METRIC_PATH,
        value: target.size.bytes,
      });
    }

    if (target.language !== undefined) {
      this.indexLanguage(index, target.language);
    }

    return index;
  }

  /**
   * Explains a name two measured targets both answered to. The second target is dropped; the run continues with the first.
   */
  private describeDuplicate(target: string): DuplicateTargetFinding {
    return {
      reason: `Two measured targets are called "${target}". A limit addresses its metric by target name, so the name has to belong to one of them; the second was dropped.`,
      target,
    };
  }

  /** Indexes a group of counters, descending into the nested ones. */
  private indexCounters(
    index: TargetMetricIndex,
    counters: Record<string, unknown>,
    prefix: string,
  ): void {
    for (const [name, value] of Object.entries(counters)) {
      const metricPath =
        prefix === "" ? name : `${prefix}${METRIC_PATH_SEPARATOR}${name}`;

      if (typeof value === "number") {
        this.addMetric({ index, metricPath, value });
      } else if (this.isCounterGroup(value)) {
        this.indexCounters(index, value, metricPath);
      }
    }
  }

  /**
   * Indexes everything language analysis counted. Configured counters sit under a prefix, so a counter named `files` cannot shadow the file count.
   */
  private indexLanguage(
    index: TargetMetricIndex,
    language: CodeStatisticsResult,
  ): void {
    const { custom, ...groups } = language;

    this.indexCounters(index, groups, "");

    for (const statistic of custom) {
      this.addMetric({
        index,
        instances: statistic.instances,
        metricPath: `${CUSTOM_METRIC_PREFIX}${METRIC_PATH_SEPARATOR}${statistic.label}`,
        value: statistic.count,
      });
    }
  }

  /** Whether a statistics entry holds counters of its own. */
  private isCounterGroup(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  // 🌎 Public Methods

  /**
   * Indexes every measured target by name. A repeated name is collected rather than thrown, and the later target is dropped.
   */
  index(targets: readonly MeasuredTarget[]): MetricIndexResult {
    const duplicates: DuplicateTargetFinding[] = [];
    const indexes = new Map<string, TargetMetricIndex>();

    for (const target of targets) {
      if (indexes.has(target.name)) {
        duplicates.push(this.describeDuplicate(target.name));
        continue;
      }

      indexes.set(target.name, this.buildTargetIndex(target));
    }

    return { duplicates, indexes };
  }
}
