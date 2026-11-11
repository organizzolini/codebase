// 🏷️ Types

import type { codometerReportSchema } from "./changes.constants";
import type { z } from "zod";

/** One codometer report, as far as this diff reads it. */
export type CodometerReport = z.infer<typeof codometerReportSchema>;

/** Arguments for reading one project's report and its baseline. */
export interface CollectProjectRowsArguments extends CollectRowsArguments {
  reportPath: string;
}

/** Arguments for joining measured reports to a baseline. */
export interface CollectRowsArguments {
  baselineDirectory: string | undefined;
  workingDirectory: string;
}

/** Rows plus unmeasured targets; rows alone would hide a failure. */
export interface MetricCollection {
  failures: ProjectFailure[];
  rows: MetricRow[];
}

/** A metric with its measuring project and baseline. */
export interface MetricRow extends ReportMetric {
  baseValue: number | undefined;
  /** False when this run did not rebuild the project, so the baseline stands in. */
  measured: boolean;
  project: string;
  /** True when the baseline had this metric and the current run does not. */
  removed: boolean;
}

/** How hard a breached limit lands: advisory, or fatal. */
export type MetricSeverity = "fail" | "warn";

/** The denomination a metric's value is counted in. */
export type MetricUnit = "bytes" | null;

/** A failed project run; a `target` failure omits its rows. */
export interface ProjectFailure extends ReportFailure {
  project: string;
}

/** What one project's report yielded: its metrics, and what failed. */
export interface ProjectReport {
  failures: ReportFailure[];
  metrics: ReportMetric[];
}

/** One report's failure entry, as codometer writes it. */
export type ReportFailure = NonNullable<CodometerReport["failures"]>[number];

/** One limit as the report carries it. */
export type ReportLimit =
  CodometerReport["targets"][number]["metrics"][number]["limits"][number];

/** One measured metric and its limits; unfiltered by unit. */
export interface ReportMetric {
  /**
   * The severity of the worst breached limit, if any.
   *
   * `undefined` for no breach, else `"warn"` or `"fail"`.
   */
  breach: MetricSeverity | undefined;
  /**
   * True when the target's globs matched no files.
   *
   * Read from the report, since a target matching nothing clears every limit against it.
   */
  empty: boolean;
  /** What the row is called in the table: the written label, else its target. */
  label: string;
  /**
   * The enforced limit, absent where nothing limits the metric.
   *
   * The lowest `fail` limit, else the lowest `warn`.
   */
  limit: number | undefined;
  /**
   * The metric's name, the key it joins to its baseline on.
   *
   * Stable by construction, so it never reads as remove plus add.
   */
  name: string;
  /** What `value` is denominated in, so a renderer can format it correctly. */
  unit: MetricUnit;
  value: number;
}

/** One target's report, before its metrics are pulled out of it. */
export type ReportTarget = CodometerReport["targets"][number];
